import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { useTrackion, useCaptureError } from "@trackion/web/react";
import { useCart } from "../hooks/useCart";

// Mock product data - in real app this would come from an API
const PRODUCTS = {
  "1": {
    id: "1",
    name: "Analytics Dashboard Pro",
    description:
      "Professional analytics dashboard with real-time insights and advanced reporting capabilities. Perfect for enterprise teams who need deep visibility into their data.",
    price: 299,
    category: "Software",
    image: "📊",
    features: [
      "Real-time analytics dashboard",
      "Advanced filtering and segmentation",
      "Custom reports and exports",
      "Team collaboration tools",
      "API access included",
      "24/7 premium support",
    ],
    rating: 4.8,
    reviews: 147,
  },
  "2": {
    id: "2",
    name: "Event Tracker Starter",
    description:
      "Basic event tracking solution perfect for small websites and personal projects. Get started with analytics without the complexity.",
    price: 99,
    category: "Software",
    image: "📈",
    features: [
      "Basic event tracking",
      "Simple dashboard",
      "Up to 100k events/month",
      "Email support",
      "Easy integration",
    ],
    rating: 4.5,
    reviews: 89,
  },
  // Add more products as needed...
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const trackion = useTrackion();
  const captureError = useCaptureError();
  const { addToCart } = useCart();

  const product = id ? PRODUCTS[id as keyof typeof PRODUCTS] : null;

  useEffect(() => {
    if (!product && id) {
      // This is an example of manual error capture
      captureError(new Error(`Product not found: ${id}`), {
        product_id: id,
        page: "product_detail",
        user_action: "page_load",
      });

      trackion.track("product_not_found", {
        product_id: id,
        referrer: document.referrer,
      });
    } else if (product) {
      trackion.track("product_detail_viewed", {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_category: product.category,
      });
    }
  }, [product, id, trackion, captureError]);

  const handleAddToCart = () => {
    if (!product) return;

    trackion.track("add_to_cart_clicked", {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      source: "product_detail_page",
    });

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleFeatureClick = (featureName: string) => {
    if (!product) return;
    trackion.track("product_feature_highlighted", {
      product_id: product.id,
      feature: featureName,
    });
  };

  const handleReviewsClick = () => {
    if (!product) return;
    trackion.track("product_reviews_clicked", {
      product_id: product.id,
      rating: product.rating,
      review_count: product.reviews,
    });
  };

  // Simulate an intentional error for testing
  const triggerTestError = () => {
    if (!product) return;
    trackion.track("test_error_triggered", {
      product_id: product.id,
      error_type: "intentional",
      source: "product_detail_page",
    });

    throw new Error("This is a test error triggered from product detail page");
  };

  if (!product && id) {
    return (
      <div className="product-detail-page">
        <Link
          to="/products"
          className="btn btn-secondary mb-4 flex items-center gap-2"
          style={{ width: "fit-content" }}
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <div className="card text-center">
          <h1>Product Not Found</h1>
          <p style={{ color: "#64748b", marginTop: "1rem" }}>
            The product with ID "{id}" could not be found.
          </p>
          <Link
            to="/products"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="card text-center">
          <h1>Invalid Product</h1>
          <Link
            to="/products"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Link
        to="/products"
        className="btn btn-secondary mb-4 flex items-center gap-2"
        style={{ width: "fit-content" }}
      >
        <ArrowLeft size={16} />
        Back to Products
      </Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "3rem",
          alignItems: "start",
        }}
      >
        {/* Product Image */}
        <div className="card">
          <div
            className="product-image"
            style={{ height: "400px", fontSize: "8rem" }}
          >
            {product.image}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            {product.name}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.floor(product.rating) ? "#fbbf24" : "none"}
                  color="#fbbf24"
                />
              ))}
              <span style={{ color: "#64748b", marginLeft: "0.5rem" }}>
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
            <button
              onClick={handleReviewsClick}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Read Reviews
            </button>
          </div>

          <div
            className="product-price"
            style={{ fontSize: "2rem", marginBottom: "1.5rem" }}
          >
            ${product.price}
          </div>

          <p
            style={{ color: "#64748b", lineHeight: 1.6, marginBottom: "2rem" }}
          >
            {product.description}
          </p>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              style={{ fontSize: "1.125rem", padding: "1rem 2rem" }}
            >
              Add to Cart - ${product.price}
            </button>
            <button
              className="btn btn-danger btn-small"
              onClick={triggerTestError}
              title="Click to test error tracking"
            >
              Test Error 💥
            </button>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Features Included</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {product.features.map((feature, index) => (
                <li
                  key={index}
                  style={{
                    padding: "0.5rem 0",
                    borderBottom:
                      index < product.features.length - 1
                        ? "1px solid #e2e8f0"
                        : "none",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onClick={() => handleFeatureClick(feature)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={{ color: "#10b981", marginRight: "0.5rem" }}>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products Section (could be expanded) */}
      <div style={{ marginTop: "4rem" }}>
        <h2>Related Products</h2>
        <div className="card" style={{ marginTop: "1rem" }}>
          <p style={{ color: "#64748b" }}>
            Related products feature coming soon! This section would show other
            products based on user behavior data tracked by Trackion.
          </p>
        </div>
      </div>
    </div>
  );
}
