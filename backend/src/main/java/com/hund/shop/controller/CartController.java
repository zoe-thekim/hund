package com.hund.shop.controller;

import com.hund.shop.model.CartItem;
import com.hund.shop.service.CartService;
import com.hund.shop.model.User;
import com.hund.shop.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart() {
        try {
            User user = getAuthenticatedUserOrThrow();
            List<CartItem> cartItems = cartService.getCartItems(user);
            return ResponseEntity.ok(cartItems);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(@RequestBody CartItem cartItem) {
        try {
            User user = getAuthenticatedUserOrThrow();
            CartItem savedCartItem = cartService.addToCart(user, cartItem);
            return ResponseEntity.ok(savedCartItem);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUserOrThrow();
            Optional<CartItem> cartItem = cartService.getCartItem(user, id);
            if (cartItem.isPresent()) {
                cartService.removeFromCart(user, id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        try {
            User user = getAuthenticatedUserOrThrow();
            cartService.clearCart(user);
            return ResponseEntity.ok().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    private User getAuthenticatedUserOrThrow() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Unauthorized");
        }

        return userService.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }

    private static class UnauthorizedException extends RuntimeException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }
}
