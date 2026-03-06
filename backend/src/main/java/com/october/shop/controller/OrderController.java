package com.october.shop.controller;

import com.october.shop.model.*;
import com.october.shop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // 사용자별 주문 내역 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        try {
            List<Order> orders = orderService.getOrdersByUser(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderDetail(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderWithItems(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 주문 번호로 주문 조회
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByOrderNumber(orderNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 새 주문 생성
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Address deliveryAddress = new Address();
            deliveryAddress.setPostalCode(request.getPostalCode());
            deliveryAddress.setAddress(request.getAddress());
            deliveryAddress.setDetailAddress(request.getDetailAddress());

            Order order = orderService.createOrder(
                request.getUserId(),
                deliveryAddress,
                request.getDeliveryMessage(),
                request.getPaymentMethod()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", order.getId());
            response.put("orderNumber", order.getOrderNumber());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 주문에 상품 추가
    @PostMapping("/{orderId}/items")
    public ResponseEntity<Map<String, Object>> addItemToOrder(
            @PathVariable Long orderId,
            @RequestBody AddOrderItemRequest request) {
        try {
            OrderItem orderItem = orderService.addItemToOrder(
                orderId,
                request.getProductId(),
                request.getSize(),
                request.getQuantity(),
                request.getUnitPrice()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderItemId", orderItem.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 주문 확정
    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmOrder(@PathVariable Long orderId) {
        try {
            orderService.confirmOrder(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "주문이 확정되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 주문 취소
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelOrder(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            orderService.cancelOrder(orderId, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "주문이 취소되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 배송 시작 (관리자용)
    @PostMapping("/{orderId}/ship")
    public ResponseEntity<Map<String, Object>> startShipping(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String trackingNumber = request.get("trackingNumber");
            orderService.startShipping(orderId, trackingNumber);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "배송이 시작되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 배송 완료 (관리자용)
    @PostMapping("/{orderId}/deliver")
    public ResponseEntity<Map<String, Object>> completeDelivery(@PathVariable Long orderId) {
        try {
            orderService.completeDelivery(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "배송이 완료되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 주문 생성 요청 DTO
    static class CreateOrderRequest {
        private Long userId;
        private String postalCode;
        private String address;
        private String detailAddress;
        private String deliveryMessage;
        private String paymentMethod;

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public String getDetailAddress() { return detailAddress; }
        public void setDetailAddress(String detailAddress) { this.detailAddress = detailAddress; }
        public String getDeliveryMessage() { return deliveryMessage; }
        public void setDeliveryMessage(String deliveryMessage) { this.deliveryMessage = deliveryMessage; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    // 주문 아이템 추가 요청 DTO
    static class AddOrderItemRequest {
        private Long productId;
        private String size;
        private Integer quantity;
        private Integer unitPrice;

        // Getters and Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getSize() { return size; }
        public void setSize(String size) { this.size = size; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Integer getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Integer unitPrice) { this.unitPrice = unitPrice; }
    }
}