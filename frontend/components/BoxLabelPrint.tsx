'use client';

import QRCodeDisplay from './QRCodeDisplay';

interface BoxLabelPrintProps {
  boxId: string;
  qrValue: string;
  product: {
    brand: string;
    name: string;
    size?: string;
  };
  lotCode?: string;
}

export default function BoxLabelPrint({ boxId, qrValue, product, lotCode }: BoxLabelPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-label">
      <div className="no-print mb-6">
        <button
          onClick={handlePrint}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Print Label
        </button>
      </div>
      
      <div className="label-content bg-white p-8 border-2 border-gray-300">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">
            {product.brand} - {product.name}
          </h1>
          {(product.size || lotCode) && (
            <div className="text-base text-gray-600">
              {product.size && <span>{product.size}</span>}
              {product.size && lotCode && <span> • </span>}
              {lotCode && <span>Lot: {lotCode}</span>}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center justify-center mt-6">
          <div className="mb-3">
            <QRCodeDisplay value={qrValue} size={200} />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-700">Box ID: {boxId}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0.25in;
          }
          
          /* Hide toast notifications FIRST - react-hot-toast */
          [data-rht-toaster],
          div[data-rht-toaster],
          div:has([data-rht-toaster]),
          [role="status"],
          [role="alert"] {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide navigation and print button */
          nav, header, footer, .no-print {
            display: none !important;
          }
          
          /* Hide ALL page content except print-label - very aggressive */
          body > *:not(.print-label):not(:has(.print-label)),
          main > *:not(.print-label):not(:has(.print-label)),
          main > div:not(:has(.print-label)),
          body > div:not(:has(.print-label)),
          html > body > *:not(.print-label):not(:has(.print-label)) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          
          /* Hide all background elements, borders, and containers that might show through */
          div:not(.print-label):not(:has(.print-label)):not(.label-content):not(.label-content *),
          section:not(:has(.print-label)),
          article:not(:has(.print-label)),
          aside:not(:has(.print-label)) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Hide all text elements outside label-content */
          body p:not(.label-content p),
          body span:not(.label-content span),
          body h1:not(.label-content h1),
          body h2,
          body h3,
          body div:has(> h1:not(.label-content h1)),
          body div:has(> p:not(.label-content p)) {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide form elements */
          form, input, select, button:not(.no-print), label:not(.label-content), .react-select-container {
            display: none !important;
          }
          
          /* Hide instruction boxes and all page text */
          .bg-blue-50, .bg-blue-100, .border-blue-200,
          div.bg-blue-50, div.bg-blue-100 {
            display: none !important;
          }
          
          /* Hide page headers and all text outside label */
          h2, h3,
          p:not(.label-content p),
          span:not(.label-content span),
          h1:not(.label-content h1) {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide PageHeader component (the "Create Box Label" title and subtitle) */
          div:has(> h1:not(.label-content h1)),
          div:has(> p:not(.label-content p)),
          div:has(> h1) > p {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Hide lists (instruction steps) */
          ol:not(.label-content ol), ul:not(.label-content ul), li:not(.label-content li) {
            display: none !important;
          }
          
          /* Hide other icons except QR code */
          svg:not(.label-content svg) {
            display: none !important;
          }
          
          /* Hide PageHeader and all divs with text */
          div:has(> h1:not(.label-content h1)),
          div:has(> p:not(.label-content p)) {
            display: none !important;
          }
          
          /* CRITICAL: Show print-label and label-content */
          .print-label {
            display: block !important;
            visibility: visible !important;
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 4in !important;
            height: 6in !important;
            margin: 0 !important;
            padding: 0 !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            background: white !important;
            z-index: 10000 !important;
          }
          
          .label-content {
            display: flex !important;
            visibility: visible !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            border: 2px solid #000 !important;
            padding: 0.25in !important;
            background: white !important;
            color: #000 !important;
            width: 3.5in !important;
            height: 5.5in !important;
            max-height: 5.5in !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
            position: relative !important;
            z-index: 10001 !important;
            box-shadow: none !important;
          }
          
          /* Hide any elements that might be behind the label - remove all backgrounds */
          *:not(.print-label):not(.label-content):not(.label-content *) {
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            outline: none !important;
          }
          
          /* Ensure body and html have white background */
          html, body {
            background: white !important;
            background-color: white !important;
          }
          
          /* Product name section */
          .label-content > div:first-child {
            display: block !important;
            visibility: visible !important;
            text-align: center !important;
            margin-bottom: 0.25in !important;
          }
          
          /* QR code section */
          .label-content > div:last-child {
            display: flex !important;
            visibility: visible !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          /* All text visible */
          .label-content h1 {
            display: block !important;
            visibility: visible !important;
            color: #000 !important;
            font-size: 1.5rem !important;
            font-weight: bold !important;
          }
          
          .label-content p,
          .label-content span,
          .label-content div {
            display: block !important;
            visibility: visible !important;
            color: #000 !important;
          }
          
          .label-content > div:last-child {
            display: flex !important;
          }
          
          /* QR code SVG */
          .label-content svg {
            display: block !important;
            visibility: visible !important;
            width: 200px !important;
            height: 200px !important;
            margin: 0 auto !important;
          }
          
          /* Single page */
          html, body {
            height: 6in !important;
            width: 4in !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: white !important;
            background-color: white !important;
          }
          
          /* Hide all decorative elements, borders, and lines */
          *:not(.print-label):not(.label-content):not(.label-content *) {
            border: none !important;
            border-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            background-image: none !important;
          }
          
          * {
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
