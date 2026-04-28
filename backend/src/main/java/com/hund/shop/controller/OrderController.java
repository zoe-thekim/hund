package com.hund.shop.controller;

import com.hund.shop.model.*;
import com.hund.shop.service.OrderService;
import com.hund.shop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    // 사용자별 주문 내역 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        try {
            User requester = getAuthenticatedUserOrThrow();
            if (!isAuthorizedUserId(requester.getId(), userId)) {
                return ResponseEntity.status(403).build();
            }

            List<Order> orders = orderService.getOrdersByUser(userId);
            return ResponseEntity.ok(orders);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 주문 상세 조회
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderDetail(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderWithItems(orderId);
            User requester = getAuthenticatedUserOrThrow();
            if (!isOwnerOrAdmin(requester, order)) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.ok(order);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 주문 번호로 주문 조회
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        try {
            Order order = orderService.getOrderWithItemsByOrderNumber(orderNumber);
            User requester = getAuthenticatedUserOrThrow();
            if (!isOwnerOrAdmin(requester, order)) {
                return ResponseEntity.status(403).build();
            }
            return ResponseEntity.ok(order);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 새 주문 생성
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            User requester = getAuthenticatedUserOrThrow();
            Long requesterId = requester.getId();
            if (request.getUserId() == null || !Objects.equals(request.getUserId(), requesterId)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User is not allowed to create order for other users.");
                return ResponseEntity.status(403).body(response);
            }

            Address deliveryAddress = new Address();
            deliveryAddress.setPostalCode(request.getPostalCode());
            deliveryAddress.setAddress(request.getAddress());
            deliveryAddress.setDetailAddress(request.getDetailAddress());

            Order order = orderService.createOrder(
                request.getUserId(),
                deliveryAddress,
                request.getDeliveryMessage(),
                request.getPaymentMethod(),
                request.getTotalAmount(),
                request.getShippingFee()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", order.getId());
            response.put("orderNumber", order.getOrderNumber());

            return ResponseEntity.ok(response);
        } catch (UnauthorizedException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/number/{orderNumber}/confirm")
    public ResponseEntity<Map<String, Object>> confirmOrderByOrderNumber(
            @PathVariable String orderNumber,
            @RequestBody Map<String, Object> request) {
        try {
            Order order = orderService.getOrderByOrderNumber(orderNumber)
                    .orElseThrow(() -> new RuntimeException("Order not found."));
            User requester = getAuthenticatedUserOrThrow();
            if (!isOwnerOrAdmin(requester, order)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You are not allowed to confirm this order.");
                return ResponseEntity.status(403).body(response);
            }

            String paymentKey = request.get("paymentKey") != null
                    ? request.get("paymentKey").toString()
                    : null;
            Integer amount = request.get("amount") != null
                    ? Integer.valueOf(request.get("amount").toString())
                    : null;

            orderService.confirmOrderWithTossPaymentByOrderNumber(orderNumber, paymentKey, amount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order payment has been confirmed.");

            return ResponseEntity.ok(response);
        } catch (UnauthorizedException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
            Order order = orderService.getOrderWithItems(orderId);
            User requester = getAuthenticatedUserOrThrow();
            if (!isOwnerOrAdmin(requester, order)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You are not allowed to update this order.");
                return ResponseEntity.status(403).body(response);
            }

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
        } catch (UnauthorizedException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
            Order order = orderService.getOrderWithItems(orderId);
            User requester = getAuthenticatedUserOrThrow();
            if (!isOwnerOrAdmin(requester, order)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You are not allowed to confirm this order.");
                return ResponseEntity.status(403).body(response);
            }

            orderService.confirmOrder(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order has been confirmed.");

            return ResponseEntity.ok(response);
        } catch (UnauthorizedException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
            Order order = orderService.getOrderWithItems(orderId);
            User requester = getAuthenticatedUserOrThrow();
            if (!isOwnerOrAdmin(requester, order)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "You are not allowed to cancel this order.");
                return ResponseEntity.status(403).body(response);
            }

            String reason = request.get("reason");
            orderService.cancelOrder(orderId, reason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order has been cancelled.");

            return ResponseEntity.ok(response);
        } catch (UnauthorizedException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
            User requester = getAuthenticatedUserOrThrow();
            Order order = orderService.getOrderWithItems(orderId);
            if (!isOwnerOrAdmin(requester, order) && !isAdmin(getAuthentication())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access is required.");
                return ResponseEntity.status(403).body(response);
            }

            String trackingNumber = request.get("trackingNumber");
            orderService.startShipping(orderId, trackingNumber);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Shipping has started.");

            return ResponseEntity.ok(response);
        } catch (UnauthorizedException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
            User requester = getAuthenticatedUserOrThrow();
            Order order = orderService.getOrderWithItems(orderId);
            if (!isOwnerOrAdmin(requester, order) && !isAdmin(getAuthentication())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin access is required.");
                return ResponseEntity.status(403).body(response);
            }

            orderService.completeDelivery(orderId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Delivery has been completed.");

            return ResponseEntity.ok(response);
        } catch (UnauthorizedException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
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
        private Integer totalAmount;
        private Integer shippingFee;

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
        public Integer getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Integer totalAmount) { this.totalAmount = totalAmount; }
        public Integer getShippingFee() { return shippingFee; }
        public void setShippingFee(Integer shippingFee) { this.shippingFee = shippingFee; }
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

    private User getAuthenticatedUserOrThrow() {
        Authentication authentication = getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Unauthorized");
        }

        return userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }

    private Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private boolean isAuthorizedUserId(Long requesterId, Long targetUserId) {
        return isAdmin(getAuthentication()) || Objects.equals(requesterId, targetUserId);
    }

    private boolean isOwnerOrAdmin(User requester, Order order) {
        if (order == null || order.getUser() == null || requester == null) {
            return false;
        }

        return isAdmin(getAuthentication())
                || Objects.equals(order.getUser().getId(), requester.getId());
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }
}
