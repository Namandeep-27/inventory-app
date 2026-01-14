'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getProducts, createProduct } from '@/lib/api';
import { Product } from '@/lib/types';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Grid3x3, Package, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageTransition from '@/components/PageTransition';
import PageHeader from '@/components/PageHeader';

export default function ProductsPage() {
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    size: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      router.push('/scan');
      return;
    }
    loadProducts();
  }, [isAdmin, router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProduct = await createProduct({
        brand: formData.brand,
        name: formData.name,
        size: formData.size || undefined,
      });
      setProducts([...products, newProduct]);
      setShowCreate(false);
      setFormData({ brand: '', name: '', size: '' });
      toast.success('Product created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create product');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Products"
          subtitle="Manage your product catalog. Products define what can be stored in boxes and are required before creating box labels."
        >
          <motion.button
            onClick={() => setShowCreate(!showCreate)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl',
              'hover:bg-blue-700 transition-colors text-sm font-semibold shadow-lg hover:shadow-xl'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showCreate ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Product
              </>
            )}
          </motion.button>
        </PageHeader>

        <motion.div
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-2 text-blue-900">Product catalog tips:</p>
              <ul className="list-disc list-inside space-y-1.5 text-sm text-blue-800">
                <li>Create products before generating box labels</li>
                <li>Use Size to differentiate variants (e.g., 250ml, 500ml, 750ml)</li>
                <li>Each unique Brand + Name + Size combination is a separate product</li>
                <li>Products can be used across multiple boxes</li>
              </ul>
            </div>
        </div>
        </motion.div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Product</h2>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Jack Daniels"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., Whiskey"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Size (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 750ml"
                    />
                  </div>
                </div>
                <motion.button
                  type="submit"
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Product
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
            <LoadingSpinner size="lg" className="mx-auto" />
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Size
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {products.map((product, index) => (
                  <motion.tr
                    key={product.product_id}
                    className="hover:bg-slate-50 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {product.size || '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-900 mb-2">No products found</p>
                <p className="text-sm text-slate-600">Create your first product to start generating box labels</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
