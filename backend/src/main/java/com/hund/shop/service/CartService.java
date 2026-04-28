package com.hund.shop.service;

import com.hund.shop.model.CartItem;
import com.hund.shop.model.User;
import com.hund.shop.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUser(user);
    }

    public CartItem addToCart(User user, CartItem cartItem) {
        cartItem.setUser(user);
        return cartItemRepository.save(cartItem);
    }

    public Optional<CartItem> getCartItem(User user, Long id) {
        return cartItemRepository.findByIdAndUser(id, user);
    }

    public void removeFromCart(User user, Long id) {
        getCartItem(user, id).orElseThrow(() -> new RuntimeException("Cart item not found."));
        cartItemRepository.deleteById(id);
    }

    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }
}
