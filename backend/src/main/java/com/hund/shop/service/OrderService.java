package com.hund.shop.service;

import com.hund.shop.model.*;
import com.hund.shop.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Collections;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class OrderService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderService.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryHistoryRepository inventoryHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Value("${toss.payment.secret-key:}")
    private String tossSecretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // 사용자별 주문 내역 조회
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // 주문 번호로 주문 조회
    @Transactional(readOnly = true)
    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    @Transactional(readOnly = true)
    public Order getOrderWithItemsByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        order.setOrderItems(orderItems);
        return order;
    }

    // 주문 상세 정보 조회 (주문 아이템 포함)
    @Transactional(readOnly = true)
    public Order getOrderWithItems(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        // 주문 아이템 로드 (Lazy loading 대응)
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        order.setOrderItems(orderItems);

        return order;
    }

    // 새 주문 생성
    public Order createOrder(Long userId, Address deliveryAddress, String deliveryMessage, String paymentMethod, Integer totalAmount, Integer shippingFee) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(deliveryAddress);
        order.setDeliveryMessage(deliveryMessage);
        order.setPaymentMethod(paymentMethod);
        order.setTotalAmount(totalAmount != null ? totalAmount : 0);
        order.setShippingFee(shippingFee != null ? shippingFee : 0);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);

        return orderRepository.save(order);
    }

    public void confirmOrderWithTossPayment(Long orderId, String paymentKey, Integer amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        final int expectedAmount = resolveExpectedAmount(order);
        if (amount == null || amount != expectedAmount) {
            throw new RuntimeException("Payment amount mismatch.");
        }

        confirmPaymentWithToss(order, paymentKey, amount);
    }

    public void confirmOrderWithTossPaymentByOrderNumber(String orderNumber, String paymentKey, Integer amount) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        final int expectedAmount = resolveExpectedAmount(order);
        if (amount == null || amount != expectedAmount) {
            throw new RuntimeException("Payment amount mismatch.");
        }

        confirmPaymentWithToss(order, paymentKey, amount);
    }

    private void confirmPaymentWithToss(Order order, String paymentKey, Integer amount) {
        String secretKey = normalizeSecretKey();
        if (!StringUtils.hasText(secretKey)) {
            throw new RuntimeException("Toss secret key is not configured.");
        }

        if (!StringUtils.hasText(paymentKey)) {
            throw new RuntimeException("Payment key is missing.");
        }

        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("paymentKey", paymentKey);
        requestPayload.put("orderId", order.getOrderNumber());
        requestPayload.put("amount", amount);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("Authorization", "Basic " + Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8)));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

        ResponseEntity<Map> confirmResponse;
        try {
            confirmResponse = restTemplate.exchange(
                    "https://api.tosspayments.com/v1/payments/confirm",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
        } catch (HttpStatusCodeException e) {
            String body = e.getResponseBodyAsString();
            String status = e.getStatusCode() == null ? "unknown" : e.getStatusCode().toString();
            log.error("Toss payment confirmation failed. orderNumber={}, status={}, body={}", order.getOrderNumber(), status, body);
            throw new RuntimeException("Toss payment confirmation failed: " + status);
        } catch (RuntimeException e) {
            log.error("Toss payment confirmation request failed. orderNumber={}", order.getOrderNumber(), e);
            throw e;
        }

        Map<String, Object> responseBody = confirmResponse.getBody() == null
                ? new HashMap<>()
                : confirmResponse.getBody();

        if (responseBody != null && responseBody.get("paymentKey") != null) {
            order.setPaymentKey(responseBody.get("paymentKey").toString());
        }
        if (responseBody != null && responseBody.get("method") != null) {
            order.setPaymentMethod(responseBody.get("method").toString());
        }

        // 실제 결제 검증이 완료된 뒤에만 주문 확정 및 재고 반영
        confirmOrder(order.getId());
    }

    // 주문에 상품 추가
    public OrderItem addItemToOrder(Long orderId, Long productId, String size, Integer quantity, Integer unitPrice) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Item quantity must be greater than zero.");
        }

        if (unitPrice == null || unitPrice <= 0) {
            throw new RuntimeException("Item price is missing.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found."));

        // 해당 상품의 재고 조회
        Inventory inventory = inventoryRepository.findByProductAndSize(product, size)
                .orElseThrow(() -> new RuntimeException("Inventory for selected size was not found."));

        // 재고 확인 및 예약
        if (!inventory.reserveStock(quantity)) {
            throw new RuntimeException("Insufficient stock. Available quantity: " + inventory.getAvailableQuantity());
        }

        // 재고 저장
        inventoryRepository.save(inventory);

        // 재고 이력 저장
        createInventoryHistory(inventory, null, InventoryHistory.TransactionType.RESERVE,
                              -quantity, inventory.getAvailableQuantity() + quantity,
                              inventory.getAvailableQuantity(), "ORDER", order.getId(),
                              "Order stock reserved", "SYSTEM");

        // 주문 아이템 생성
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setInventory(inventory);
        orderItem.setProductName(product.getName());
        orderItem.setSize(size);
        orderItem.setQuantity(quantity);
        orderItem.setPrice(unitPrice);
        orderItem.setUnitPrice(unitPrice);
        orderItem.setItemStatus(OrderItem.ItemStatus.PENDING);

        return orderItemRepository.save(orderItem);
    }

    // 주문 확정 (결제 완료 후)
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

        // 각 주문 아이템의 예약된 재고를 실제 재고에서 차감
        for (OrderItem item : orderItems) {
            Inventory inventory = item.getInventory();

            if (!inventory.confirmReservedStock(item.getQuantity())) {
                throw new RuntimeException("An error occurred while confirming reserved stock.");
            }

            inventoryRepository.save(inventory);

            // 재고 이력 저장
            createInventoryHistory(inventory, item, InventoryHistory.TransactionType.SALE,
                                  -item.getQuantity(), inventory.getStockQuantity() + item.getQuantity(),
                                  inventory.getStockQuantity(), "ORDER", order.getId(),
                                  "Order confirmed - stock reduced", "SYSTEM");

            // 주문 아이템 상태 업데이트
            item.setItemStatus(OrderItem.ItemStatus.CONFIRMED);
            orderItemRepository.save(item);
        }

        // 주문 상태 업데이트
        order.setStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
        orderRepository.save(order);
    }

    // 주문 취소
    public void cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order cannot be cancelled in its current status.");
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

        // 예약된 재고 해제
        for (OrderItem item : orderItems) {
            Inventory inventory = item.getInventory();

            if (item.getItemStatus() == OrderItem.ItemStatus.PENDING) {
                // 예약만 된 상태라면 예약 해제
                inventory.releaseReservedStock(item.getQuantity());
            } else if (item.getItemStatus() == OrderItem.ItemStatus.CONFIRMED) {
                // 이미 차감된 상태라면 재고 복구
                inventory.addStock(item.getQuantity());
            }

            inventoryRepository.save(inventory);

            // 재고 이력 저장
            createInventoryHistory(inventory, item, InventoryHistory.TransactionType.RELEASE,
                                  item.getQuantity(), inventory.getAvailableQuantity() - item.getQuantity(),
                                  inventory.getAvailableQuantity(), "ORDER", order.getId(),
                                  "Order canceled - " + reason, "SYSTEM");

            // 주문 아이템 상태 업데이트
            item.setItemStatus(OrderItem.ItemStatus.CANCELLED);
            orderItemRepository.save(item);
        }

        // 주문 상태 업데이트
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    // 배송 시작
    public void startShipping(Long orderId, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        order.setStatus(Order.OrderStatus.SHIPPED);
        order.setTrackingNumber(trackingNumber);
        order.setShippedAt(LocalDateTime.now());

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem item : orderItems) {
            item.setItemStatus(OrderItem.ItemStatus.SHIPPED);
            orderItemRepository.save(item);
        }

        orderRepository.save(order);
    }

    // 배송 완료
    public void completeDelivery(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        order.setStatus(Order.OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem item : orderItems) {
            item.setItemStatus(OrderItem.ItemStatus.DELIVERED);
            orderItemRepository.save(item);
        }

        orderRepository.save(order);
    }

    // 재고 이력 생성 헬퍼 메소드
    private void createInventoryHistory(Inventory inventory, OrderItem orderItem,
                                       InventoryHistory.TransactionType transactionType,
                                       Integer quantityChange, Integer quantityBefore,
                                       Integer quantityAfter, String referenceType,
                                       Long referenceId, String notes, String createdBy) {
        InventoryHistory history = new InventoryHistory();
        history.setInventory(inventory);
        history.setOrderItem(orderItem);
        history.setTransactionType(transactionType);
        history.setQuantityChange(quantityChange);
        history.setQuantityBefore(quantityBefore);
        history.setQuantityAfter(quantityAfter);
        history.setReferenceType(referenceType);
        history.setReferenceId(referenceId);
        history.setNotes(notes);
        history.setCreatedBy(createdBy);

        inventoryHistoryRepository.save(history);
    }

    private int resolveExpectedAmount(Order order) {
        if (order.getTotalAmount() != null && order.getTotalAmount() > 0) {
            return order.getTotalAmount();
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        int itemTotal = orderItems.stream()
                .mapToInt(item -> Optional.ofNullable(item.getTotalPrice()).orElse(item.getUnitPrice() * item.getQuantity()))
                .sum();
        int shippingFee = order.getShippingFee() != null ? order.getShippingFee() : 0;
        return itemTotal + shippingFee;
    }

    private String normalizeSecretKey() {
        if (!StringUtils.hasText(tossSecretKey)) {
            return null;
        }

        return tossSecretKey.trim();
    }
}
