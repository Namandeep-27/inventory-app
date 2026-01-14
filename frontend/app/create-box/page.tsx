'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import { createBox, getProducts } from '@/lib/api';
import { Product, Box } from '@/lib/types';
import BoxLabelPrint from '@/components/BoxLabelPrint';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Maximize2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageTransition from '@/components/PageTransition';
import PageHeader from '@/components/PageHeader';

export default function CreateBoxPage() {
  const { isAdmin } = useUserRole();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lotCode, setLotCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [createdBox, setCreatedBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/scan');
      return;
    }
    loadProducts();
  }, [isAdmin, router]);

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCreateBox = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    setLoading(true);
    try {
      const box = await createBox({
        product_id: selectedProduct.product_id,
        lot_code: lotCode || undefined,
      });
      setCreatedBox(box);
      toast.success('Box label generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create box');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  const productOptions = products.map((p) => ({
    value: p.product_id,
    label: `${p.brand} - ${p.name}${p.size ? ` (${p.size})` : ''}`,
    product: p,
  }));

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Create Box Label"
          subtitle="Generate printable QR code labels for physical boxes. Each label includes a unique box ID that can be scanned throughout the warehouse workflow."
        />

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
              <p className="font-semibold mb-2 text-blue-900">How to create a box label:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-sm text-blue-800">
                <li>Select the product this box will contain</li>
                <li>Optionally add a lot code if tracking by batch</li>
                <li>Click "Generate Box Label" to create the label</li>
                <li>Print the label and attach it to the physical box</li>
                <li>Once attached, scan the label when receiving the box into inventory</li>
              </ol>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product <span className="text-red-500">*</span>
            </label>
            {productsLoading ? (
              <LoadingSpinner size="md" />
            ) : (
              <Select
                options={productOptions}
                onChange={(option) => setSelectedProduct(option?.product || null)}
                placeholder="Select a product..."
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            )}
            {products.length === 0 && !productsLoading && (
              <p className="mt-2 text-sm text-slate-600">
                No products found. <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium">Create a product first</Link>.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Lot Code (Optional)
            </label>
            <input
              type="text"
              value={lotCode}
              onChange={(e) => setLotCode(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="e.g., L2026-01"
            />
            <p className="mt-1.5 text-xs text-slate-500">Use lot codes to track batches or production dates</p>
          </div>

          <motion.button
            onClick={handleCreateBox}
            disabled={loading || !selectedProduct}
            className={cn(
              'w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl',
              'hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed',
              'transition-colors flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl'
            )}
            whileHover={{ scale: loading || !selectedProduct ? 1 : 1.02 }}
            whileTap={{ scale: loading || !selectedProduct ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Generating...
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                Generate Box Label
              </>
            )}
          </motion.button>
        </motion.div>

        {createdBox && (
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Generated Label</h2>
              <p className="text-sm text-slate-600">Print this label and attach it to the physical box</p>
            </div>
            <BoxLabelPrint
              boxId={createdBox.box_id}
              qrValue={createdBox.qr_value}
              product={createdBox.product}
              lotCode={createdBox.lot_code}
            />
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
