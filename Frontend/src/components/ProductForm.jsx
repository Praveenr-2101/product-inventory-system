import { useEffect, useRef, useState } from "react";
import Layout from "../pages/Layout";
import { API_ROUTES } from "../utils/apiRoutes";
import useAuth from '../hooks/useAuth';

const initialProduct = {
  ProductName: "",
  ProductImage: "",
  HSNCode: "",
  IsFavourite: false,
  variants: [],
  ProductID: "",
  ProductCode: "",
};

function ProductForm() {

  const { authAxios } = useAuth();

  const [product, setProduct] = useState(initialProduct);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchProductCode = async () => {
      try {

        const res = await authAxios.get(API_ROUTES.PRODUCT_CODE);

        const data = res.data;

        setProduct(prev => ({
          ...prev,
          ProductID: data?.ProductID || "",
          ProductCode: data?.ProductCode || "",
        }));
      } catch (err) {
        setError("Unable to fetch product ID and code.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductCode();
  }, [authAxios]);

  const handleInputChange = (e, field) => {
    setProduct(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProduct(prev => ({ ...prev, ProductImage: "" }));
      setFilePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProduct(prev => ({ ...prev, ProductImage: reader.result }));
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFavouriteToggle = () => {
    setProduct(prev => ({ ...prev, IsFavourite: !prev.IsFavourite }));
  };

  const updateVariants = (variants) => {
    setProduct(prev => ({ ...prev, variants }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...product.variants];
    if (!updated[index]) updated[index] = { name: "", options: [{ value: "", stock: 0 }] };
    updated[index][field] = value;
    updateVariants(updated);
  };

  const handleSubVariantChange = (variantIndex, subIndex, field, value) => {
    const updated = [...product.variants];
    if (!updated[variantIndex]) updated[variantIndex] = { name: "", options: [] };
    if (!updated[variantIndex].options[subIndex]) {
      updated[variantIndex].options[subIndex] = { value: "", stock: 0 };
    }

    updated[variantIndex].options[subIndex][field] =
      field === "stock" ? (value === "" ? "" : parseInt(value, 10) || 0) : value;

    updateVariants(updated);
  };

  const addVariant = () => {
    updateVariants([...product.variants, { name: "", options: [{ value: "", stock: 0 }] }]);
  };

  const addSubVariant = (variantIndex) => {
    const updated = [...product.variants];
    updated[variantIndex].options.push({ value: "", stock: 0 });
    updateVariants(updated);
  };

  const removeVariant = (index) => {
    const updated = product.variants.filter((_, i) => i !== index);
    updateVariants(updated);
  };

  const removeSubVariant = (variantIndex, subIndex) => {
    const updated = [...product.variants];
    const options = updated[variantIndex].options;
    updated[variantIndex].options =
      options.length === 1
        ? [{ value: "", stock: 0 }]
        : options.filter((_, i) => i !== subIndex);

    updateVariants(updated);
  };

  const validateForm = () => {
    for (const variant of product.variants) {
      if (!variant.name.trim()) return "All variant names are required.";
      if (!variant.options.length)
        return `Variant "${variant.name}" must have at least one option.`;

      for (const option of variant.options) {
        if (!option.value.trim())
          return `Option value for variant "${variant.name}" cannot be empty.`;
        if (option.stock === "" || option.stock < 0)
          return `Stock for option "${option.value}" in variant "${variant.name}" must be a non-negative number.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const payload = { ...product };
      
      if (!payload.ProductImage) {
        delete payload.ProductImage;
      }

      const res = await authAxios.post(API_ROUTES.PRODUCT_REGISTER, payload);

      setMessage("Product registered successfully!");
      setProduct(initialProduct);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const errorMsg =
        err?.response?.data?.non_field_errors?.join(", ") ||
        JSON.stringify(err?.response?.data) ||
        "Server error";
      setError(errorMsg);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading product details...</p>;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-4xl hover:shadow-lg transition">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-8">
            📝 Product Registration
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
    
            <div>
              <label className="block text-lg font-medium text-gray-700">Product ID</label>
              <input
                type="text"
                value={product.ProductID}
                disabled
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">Product Code</label>
              <input
                type="text"
                value={product.ProductCode}
                disabled
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">Product Title</label>
              <input
                type="text"
                value={product.ProductName}
                onChange={(e) => handleInputChange(e, "ProductName")}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                placeholder="Enter product title"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">HSN Code</label>
              <input
                type="text"
                value={product.HSNCode}
                onChange={(e) => handleInputChange(e, "HSNCode")}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                placeholder="Enter HSN code"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">Product Image Upload</label>
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
                accept="image/*"
                className="w-full p-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">Mark as Favourite</label>
              <input
                type="checkbox"
                checked={product.IsFavourite}
                onChange={handleFavouriteToggle}
                className="h-5 w-5 text-blue-600 rounded"
              />
            </div>

            <div className="mt-10 bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Product Variants</h3>

              {product.variants.map((variant, i) => (
                <div key={i} className="mb-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleVariantChange(i, "name", e.target.value)}
                      placeholder="Variant Name (e.g. Size)"
                      className="w-full sm:w-1/2 mb-2 sm:mb-0 border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="sm:ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Remove Variant
                    </button>
                  </div>

                  {variant.options.map((option, j) => (
                    <div
                      key={j}
                      className="border border-gray-100 p-5 rounded-xl mb-4 bg-white shadow-sm hover:shadow-md"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-lg font-medium text-gray-700">Option Value</label>
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) => handleSubVariantChange(i, j, "value", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                            placeholder="e.g., Red"
                          />
                        </div>
                        <div>
                          <label className="block text-lg font-medium text-gray-700">Stock Quantity</label>
                          <input
                            type="number"
                            value={option.stock}
                            onChange={(e) => handleSubVariantChange(i, j, "stock", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                            placeholder="e.g., 10"
                            min="0"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSubVariant(i, j)}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Remove Sub-Variant
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSubVariant(i)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Sub-Variant
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addVariant}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Variant
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Register Product
            </button>

            {/* Feedback */}
            {message && <p className="text-green-600 mt-4 text-center">{message}</p>}
            {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default ProductForm;
