package com.october.shop.service;

import com.october.shop.model.*;
import com.october.shop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

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

    // 사용자별 주문 내역 조회
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // 주문 번호로 주문 조회
    @Transactional(readOnly = true)
    public Optional<Order> getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }

    // 주문 상세 정보 조회 (주문 아이템 포함)
    @Transactional(readOnly = true)
    public Order getOrderWithItems(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

        // 주문 아이템 로드 (Lazy loading 대응)
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        order.setOrderItems(orderItems);

        return order;
    }

    // 새 주문 생성
    public Order createOrder(Long userId, Address deliveryAddress, String deliveryMessage, String paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(deliveryAddress);
        order.setDeliveryMessage(deliveryMessage);
        order.setPaymentMethod(paymentMethod);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);

        return orderRepository.save(order);
    }

    // 주문에 상품 추가
    public OrderItem addItemToOrder(Long orderId, Long productId, String size, Integer quantity, Integer unitPrice) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        // 해당 상품의 재고 조회
        Inventory inventory = inventoryRepository.findByProductAndSize(product, size)
                .orElseThrow(() -> new RuntimeException("해당 사이즈의 재고를 찾을 수 없습니다."));

        // 재고 확인 및 예약
        if (!inventory.reserveStock(quantity)) {
            throw new RuntimeException("재고가 부족합니다. 사용 가능한 재고: " + inventory.getAvailableQuantity());
        }

        // 재고 저장
        inventoryRepository.save(inventory);

        // 재고 이력 저장
        createInventoryHistory(inventory, null, InventoryHistory.TransactionType.RESERVE,
                              -quantity, inventory.getAvailableQuantity() + quantity,
                              inventory.getAvailableQuantity(), "ORDER", order.getId(),
                              "주문 재고 예약", "SYSTEM");

        // 주문 아이템 생성
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setInventory(inventory);
        orderItem.setProductName(product.getName());
        orderItem.setSize(size);
        orderItem.setQuantity(quantity);
        orderItem.setUnitPrice(unitPrice);
        orderItem.setItemStatus(OrderItem.ItemStatus.PENDING);

        return orderItemRepository.save(orderItem);
    }

    // 주문 확정 (결제 완료 후)
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);

        // 각 주문 아이템의 예약된 재고를 실제 재고에서 차감
        for (OrderItem item : orderItems) {
            Inventory inventory = item.getInventory();

            if (!inventory.confirmReservedStock(item.getQuantity())) {
                throw new RuntimeException("재고 확정 처리 중 오류가 발생했습니다.");
            }

            inventoryRepository.save(inventory);

            // 재고 이력 저장
            createInventoryHistory(inventory, item, InventoryHistory.TransactionType.SALE,
                                  -item.getQuantity(), inventory.getStockQuantity() + item.getQuantity(),
                                  inventory.getStockQuantity(), "ORDER", order.getId(),
                                  "주문 확정 - 재고 차감", "SYSTEM");

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
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("취소할 수 없는 주문 상태입니다.");
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
                                  "주문 취소 - " + reason, "SYSTEM");

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
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

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
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다."));

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
}