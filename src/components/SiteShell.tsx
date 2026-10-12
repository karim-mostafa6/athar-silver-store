"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { StoreProvider, useStore } from "@/context/StoreContext";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { RingSizeGuideModal } from "@/components/RingSizeGuideModal";
import { ProductQuickViewModal } from "@/components/ProductQuickViewModal";
import { Toast } from "@/components/Toast";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { Footer } from "@/components/Footer";

const ShellInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useStore();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-[#1c1815] flex flex-col selection:bg-[#dfd2bf] selection:text-[#181513]">
        {/* Toast Notifications */}
        <Toast toasts={store.toasts} onDismiss={store.removeToast} />
        {/* Standalone Admin Portal Content */}
        <main className="flex-1 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1815] flex flex-col selection:bg-[#dfd2bf] selection:text-[#181513]">
      {/* Toast Notifications */}
      <Toast toasts={store.toasts} onDismiss={store.removeToast} />

      {/* Main Sticky Navbar */}
      <Navbar
        onOpenCart={() => store.setIsCartOpen(true)}
        onOpenWishlist={() => store.setIsWishlistOpen(true)}
        onOpenSizeGuide={() => store.setIsSizeGuideOpen(true)}
        onNotify={store.addToast}
      />

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer onOpenSizeGuide={() => store.setIsSizeGuideOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={store.isCartOpen}
        onClose={() => store.setIsCartOpen(false)}
        cartItems={store.cartItems}
        onUpdateQuantity={store.updateQuantity}
        onRemoveItem={store.removeFromCart}
        onProceedToCheckout={() => {
          store.setIsCartOpen(false);
          store.setIsCheckoutOpen(true);
        }}
        appliedPromo={store.appliedPromo}
        setAppliedPromo={store.setAppliedPromo}
        discountAmount={store.discountAmount}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={store.isWishlistOpen}
        onClose={() => store.setIsWishlistOpen(false)}
        wishlist={store.wishlist}
        onRemoveWishlist={store.toggleWishlist}
        onAddToCart={(p) => store.addToCart(p)}
        onNotify={store.addToast}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={store.isCheckoutOpen}
        onClose={() => store.setIsCheckoutOpen(false)}
        cartItems={store.cartItems}
        discountAmount={store.discountAmount}
        appliedPromo={store.appliedPromo}
        onOrderSuccess={() => store.clearCart()}
      />

      {/* Ring Size Guide Modal */}
      <RingSizeGuideModal
        isOpen={store.isSizeGuideOpen}
        onClose={() => store.setIsSizeGuideOpen(false)}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={store.quickViewProduct}
        onClose={() => store.setQuickViewProduct(null)}
        isWishlisted={
          store.quickViewProduct ? store.isWishlisted(store.quickViewProduct.id) : false
        }
        onToggleWishlist={store.toggleWishlist}
        onAddToCart={store.addToCart}
        onOpenSizeGuide={() => store.setIsSizeGuideOpen(true)}
        onNotify={store.addToast}
      />

      {/* Floating Customer Service WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
};

export const SiteShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StoreProvider>
      <ShellInner>{children}</ShellInner>
    </StoreProvider>
  );
};
