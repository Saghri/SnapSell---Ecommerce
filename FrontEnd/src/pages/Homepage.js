import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import axios from "axios";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";
import './Homepage.css'; 

const Homepage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get All Categories
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/all-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);

  // Get products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/products/product-list/${page}`);
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // Get Total Count
  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/products/product-count");
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);

  // Load more
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/products/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Filter by Category
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };
  useEffect(() => {
    if (!checked.length || !radio.length) getAllProducts();
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  // Get filtered product
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/products/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Layout title={"All Products - Best Offers"}>
        <div className="container-fluid row mt-3">
          <div className="col-md-2">
            <h4 className="text-center">Filter By Category</h4>
            <div className="d-flex flex-column">
              {categories?.map((c) => (
                <Checkbox
                  key={c._id}
                  onChange={(e) => handleFilter(e.target.checked, c._id)}
                >
                  {c.name}
                </Checkbox>
              ))}
            </div>
            {/* price filter */}
            <h4 className="text-center mt-4">Filter By Price</h4>
            <div className="d-flex flex-column">
              <Radio.Group onChange={(e) => setRadio(e.target.value)}>
                {Prices?.map((p) => (
                  <div key={p._id}>
                    <Radio value={p.array}>{p.name}</Radio>
                  </div>
                ))}
              </Radio.Group>
            </div>
            <div className="d-flex flex-column">
              <button
                className="btn btn-danger"
                onClick={() => window.location.reload()}
              >
                RESET FILTERS
              </button>
            </div>
          </div>
                        <div className="col-md-9">
                          <h1 className="text-center">All Products</h1>
                       

                          <div className="d-flex flex-wrap">
  {products?.map((p) => (
    <div 
      key={p.name} 
      className="card m-2" 
      style={{ width: "14rem" }}
      onClick={() => navigate(`/products/${p.slug}`)}  // Add onClick to the card
    >
      <img
        src={`/api/v1/products/product-image/${p._id}`}
        className="card-img-top"
        height={"150px"}
        alt={p.name}
      />

      <div className="product-info">
         <h5 className="titleOfCard">{p.name}</h5>
         <p className="product-price"> 
          <span>${p.price - (p.price * 40 / 100)}</span> <del>${p.price}</del>
         </p> 
         <div class="product-details1">
                                                <div class="rating">
                                                    <span class="golden-star">&#9733;</span>
                                                    <span class="golden-star">&#9733;</span>
                                                    <span class="golden-star">&#9733;</span>
                                                    <span class="golden-star">&#9733;</span>
                                                    <span class="golden-star">&#9733;</span>
                                                </div>
                                            <span class="reviews"> (88 reviews) </span>
                                        </div>
        <button
          className="btn btn-secondary btn-sm ms-1"
          style={{ fontSize: "12px" }}
          onClick={(event) => { // Modify onClick here
            event.stopPropagation(); // Prevent card click from propagating up 
            setCart([...cart, p]);
            localStorage.setItem(
              "cart",
              JSON.stringify([...cart, p])
            );
            toast.success("Item added to cart!");
          }}
        >
          ADD TO CART
        </button>
      </div>
    </div>
  ))}
</div>

                                          <div className="m-2 p-3">
                                            {products && products.length < total && (
                                              <button
                                                className="btn btn-warning"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  setPage(page + 1);
                                                }}
                                              >
                                                {loading ? "Loading ..." : "View More"}
                                              </button>
                                            )}
                                          </div>
                        </div>



        </div>
      </Layout>
    </>
  );
};

export default Homepage;
