import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { QuickViewProvider } from './context/QuickViewContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FooterNewsletter from './components/layout/FooterNewsletter';
import ScrollToTop from './components/layout/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin Components
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminOrders from "./pages/admin/AdminOrders";

// Global Components
import QuickViewModal from './components/product/QuickViewModal';

// Public Pages
import Home from './pages/public/Home';
import ShopPage from './pages/shop/ShopPage';
import GenderLandingPage from './pages/shop/GenderLandingPage';
import CategoryListingPage from './pages/shop/CategoryListingPage'; 
import ProductDetailsPage from './pages/product/ProductDetailsPage';
import AboutPage from './pages/AboutPage'; 
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import HelpPage from './pages/HelpPage';
import FAQPage from './pages/FAQPage';
import ReturnsPage from './pages/ReturnsPage';
import ShippingPage from './pages/ShippingPage';
import PolicyPage from './pages/PolicyPage';
import SearchPage from './pages/SearchPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Account Pages
import AccountLayout from './components/account/AccountLayout';
import AccountOverview from './pages/account/AccountOverview';
import AccountOrders from './pages/account/AccountOrders';
import AccountOrderDetails from './pages/account/AccountOrderDetails';
import AccountProfile from './pages/account/AccountProfile';
import AccountAddresses from './pages/account/AccountAddresses';
import AccountTrackOrder from './pages/account/AccountTrackOrder';
import AccountWishlist from './pages/account/AccountWishlist';
import AccountSettings from './pages/account/AccountSettings';

// Admin Auth Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminLookbook from './pages/admin/AdminLookbook';
import AdminFinance from './pages/admin/AdminFinance';

// Collections Pages
import CollectionsPage from './pages/collections/CollectionsPage';
import CollectionDetailsPage from './pages/collections/CollectionDetailsPage';

function App() {
  return (
    <AuthProvider>
      <QuickViewProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <Toaster position="bottom-right" />
              
              <Routes>
                {/* =========================================
                    1. ADMIN AUTHENTICATION (Standalone)
                ========================================= */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/signup" element={<AdminSignup />} />

                {/* =========================================
                    2. ADMIN DASHBOARD (Protected)
                ========================================= */}
                <Route 
                  path="/admin" 
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="lookbooks" element={<AdminLookbook />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="marketing" element={<AdminMarketing />} />
                  <Route path="finance" element={<AdminFinance />} />
                  <Route path="settings" element={<div style={{ padding: '2rem' }}>Settings - Coming Soon</div>} />
                </Route>

                {/* =========================================
                    3. STOREFRONT (Everything else)
                ========================================= */}
                <Route path="*" element={
                  <>
                    <AnnouncementBar />
                    <Navbar />
                    <main style={{ minHeight: '60vh' }}>
                      <Routes>
                        {/* Static Pages */}
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/track-order" element={<TrackOrderPage />} />
                        <Route path="/search" element={<SearchPage />} />

                        {/* Customer Auth Pages */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />

                        {/* Help Center & Policies */}
                        <Route path="/help" element={<HelpPage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/returns" element={<ReturnsPage />} />
                        <Route path="/shipping" element={<ShippingPage />} />
                        <Route path="/privacy" element={<PolicyPage />} />
                        <Route path="/terms" element={<PolicyPage />} />
                        <Route path="/careers" element={<PolicyPage />} />

                        {/* Account Dashboard */}
                        <Route 
                          path="/account" 
                          element={
                            <ProtectedRoute>
                              <AccountLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<AccountOverview />} />
                          <Route path="orders" element={<AccountOrders />} />
                          <Route path="orders/:orderId" element={<AccountOrderDetails />} />
                          <Route path="track-order" element={<AccountTrackOrder />} />
                          <Route path="wishlist" element={<AccountWishlist />} />
                          <Route path="addresses" element={<AccountAddresses />} />
                          <Route path="profile" element={<AccountProfile />} />
                          <Route path="settings" element={<AccountSettings />} />
                        </Route>

                        {/* Shop & Category Pages */}
                        <Route path="/shop/all" element={<GenderLandingPage genderOverride="all" />} />
                        <Route path="/shop/accessories" element={<GenderLandingPage genderOverride="accessories" />} />
                        <Route path="/shop/shoes" element={<GenderLandingPage genderOverride="shoes" />} />
                        <Route path="/shop/bags" element={<GenderLandingPage genderOverride="bags" />} />
                        <Route path="/shop/new-arrivals" element={<GenderLandingPage genderOverride="new-arrivals" />} />
                        <Route path="/shop/best-sellers" element={<GenderLandingPage genderOverride="best-sellers" />} />

                        {/* Collections */}
                        <Route path="/collections" element={<CollectionsPage />} />
                        <Route path="/collections/:slug" element={<CollectionDetailsPage />} />

                        {/* Dynamic Product Routes */}
                        <Route path="/shop/:gender" element={<GenderLandingPage />} />
                        <Route path="/shop/:gender/:category" element={<CategoryListingPage />} />
                        <Route path="/product/:slug" element={<ProductDetailsPage />} />

                        {/* 404 Fallback */}
                        <Route path="*" element={<div style={{ padding: '4rem', textAlign: 'center' }}>404 - Page Not Found</div>} />
                      </Routes>
                    </main>
                    <FooterNewsletter />
                    <Footer />
                    <QuickViewModal />
                  </>
                } />
              </Routes>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </QuickViewProvider>
    </AuthProvider>
  );
}

export default App;