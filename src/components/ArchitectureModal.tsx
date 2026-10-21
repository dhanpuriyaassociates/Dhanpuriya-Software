import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  ShieldCheck, 
  Server, 
  Layers, 
  Cpu, 
  Code2, 
  FileCheck, 
  GitBranch, 
  X,
  Copy,
  Check
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'rbac' | 'schema' | 'apis' | 'roadmap'>('architecture');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl flex flex-col max-h-[92vh] text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                FoodOS™ Enterprise Architecture Specification (v4.2.0)
              </h2>
              <p className="text-xs text-slate-400">
                Toast POS + Petpooja + Oracle Simphony + Swiggy + Shopify Admin Level Architecture
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 pt-3 pb-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          {[
            { id: 'architecture', label: '1. Software & Multi-Tenant Architecture' },
            { id: 'rbac', label: '2. Dynamic RBAC Engine & Audit Logs' },
            { id: 'schema', label: '3. PostgreSQL Database Schema' },
            { id: 'apis', label: '4. REST & WebSocket API Specs' },
            { id: 'roadmap', label: '5. Production Roadmap & SLA Matrix' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs text-slate-300">
          {activeTab === 'architecture' && (
            <div className="space-y-4 font-sans">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-orange-400 text-sm">Core High-Level Architecture</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  FoodOS operates on an <strong>Event-Driven Modular Monolith</strong> with isolated, horizontally scalable micro-daemons for real-time WebSockets (KDS bump bar dispatch), offline-first POS synchronization, and asynchronous background workers (BullMQ, Redis Cluster, S3 Archival).
                </p>
                <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-slate-300 leading-normal">
                  [ CloudFront Edge / WAF ] → [ Next.js 15 App Router & Mobile POS ]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ HTTPS / WSS<br />
                  [ AWS Application Load Balancer ] → [ Express / NestJS API Gateway ]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ Session Context Checkouts<br />
                  [ PostgreSQL Aurora Cluster with Row-Level Security (RLS) ]<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓ Events & Pub/Sub<br />
                  [ Redis 7.2 Cluster + BullMQ + Dual-Clock Sync Engine ]
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">Offline-First POS Dual-Clock Sync</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Counter POS operates on indexed local storage (IndexedDB / SQLite). When connection drops, orders generate sequential, monotonic <code>ULIDs</code> and print thermal receipts over local LAN (Raw TCP 9100). Once network resumes, the FIFO daemon calls <code>POST /api/v1/pos/sync-batch</code> with two-way Vector Clock conflict resolution.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-4 font-sans">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-purple-400 text-sm">8-Tier Role Hierarchy</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-rose-400">1. SUPER_ADMIN:</strong> Master control, business provisioning, global price override, impersonation.
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-purple-400">2. BUSINESS_OWNER:</strong> Manages own tenant across branches, staff, menus, and finance.
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-blue-400">3. BRANCH_MANAGER:</strong> Scoped to single branch. Orders, tables, inventory alerts, kitchen.
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-amber-400">4. CASHIER:</strong> POS billing, token generation, payment settlement, bill printing.
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-emerald-400">5. KITCHEN_STAFF:</strong> Multi-station KDS board, elapsed timers, station bump.
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-indigo-400">6. WAITER:</strong> Floor table seating grid, handheld order pad, service calls.
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-orange-400">7. DELIVERY_PARTNER:</strong> Route map, pickup orders, OTP handover verification.
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <strong className="text-teal-400">8. CUSTOMER:</strong> QR ordering, live order progress, prepaid wallet, loyalty points.
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-orange-400 text-sm">Action Capabilities Matrix</h4>
                <p className="text-slate-400 text-xs">
                  Every module evaluates permissions on 6 primitives: <code>CREATE</code>, <code>READ</code>, <code>UPDATE</code>, <code>DELETE</code>, <code>EXPORT</code>, and <code>APPROVE</code>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 overflow-x-auto text-slate-300">
                <pre>{`-- TENANCY & BRANCHES
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(150) NOT NULL,
    slug VARCHAR(63) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    pan_number VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_code VARCHAR(30) NOT NULL,
    branch_name VARCHAR(120) NOT NULL,
    gstin VARCHAR(15) NOT NULL,
    fssai_license_number VARCHAR(14) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) ENFORCEMENT
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON orders
    FOR ALL USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="space-y-3 font-sans">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-mono text-orange-400 font-bold">POST /api/v1/pos/orders/create</span>
                <p className="text-slate-400 text-[11px]">
                  Creates orders, computes Section 9 CGST/SGST, decrements recipe BOM inventory, routes KOTs to stations, and returns UPI Dynamic QR URI.
                </p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-mono text-emerald-400 font-bold">WSS /ws/kds/v1 (Ticket Bump Protocol)</span>
                <p className="text-slate-400 text-[11px]">
                  WebSocket pub/sub dispatching <code>KOT_STATUS_UPDATE</code> across all kitchen lines with 14ms average packet latency.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'roadmap' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-orange-400">Phase 1: Foundational MVP (Weeks 1 to 6)</strong>
                <p className="text-slate-400 text-[11px]">Multi-Tenant Core, RLS, High-Speed Counter POS, KDS Bump Bar, Razorpay UPI, ESC/POS Thermal Printing.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-emerald-400">Phase 2: Mess, Canteen & QR Engine (Weeks 7 to 12)</strong>
                <p className="text-slate-400 text-[11px]">Hostel RFID Tap Terminal, Student Meal Plans, Contactless Dine-In QR, Recipe BOM Inventory, Stock Alerts.</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-purple-400">Phase 3: Enterprise Franchise & Catering (Weeks 13 to 18)</strong>
                <p className="text-slate-400 text-[11px]">Catering Pipeline with Margin Modeler, Central Menu Master, Royalty Settlement, Advanced COGS Analytics.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
