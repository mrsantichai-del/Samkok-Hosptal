"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Folder, 
  FolderOpen, 
  Plus, 
  Minus, 
  Check, 
  Layers, 
  Sparkles,
  FileText
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecordItem {
  id: string;
  year: number;
  thaiYear: number;
  month: number;
  monthName: string;
  round: number;
  roundName?: string;
  label: string;
}

interface PayrollTreeSelectorProps {
  records: RecordItem[];
  selectedRecordId: string;
  onSelectRecord: (recordId: string) => void;
}

export default function PayrollTreeSelector({
  records,
  selectedRecordId,
  onSelectRecord
}: PayrollTreeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group records by Year (Thai Year)
  const groupedByYear = useMemo(() => {
    const map = new Map<number, { year: number; thaiYear: number; records: RecordItem[] }>();
    
    for (const rec of records) {
      const ty = rec.thaiYear || (rec.year > 2400 ? rec.year : rec.year + 543);
      if (!map.has(ty)) {
        map.set(ty, {
          year: rec.year,
          thaiYear: ty,
          records: []
        });
      }
      map.get(ty)!.records.push(rec);
    }

    // Sort years descending
    const sorted = Array.from(map.values()).sort((a, b) => b.thaiYear - a.thaiYear);
    // Sort records inside each year (latest month & round first)
    for (const g of sorted) {
      g.records.sort((a, b) => {
        if (a.month !== b.month) return b.month - a.month;
        return (b.round || 1) - (a.round || 1);
      });
    }
    return sorted;
  }, [records]);

  // Expanded years state (Set of thaiYear)
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Find currently selected record object
  const currentRecord = useMemo(() => {
    return records.find(r => r.id === selectedRecordId) || records[0];
  }, [records, selectedRecordId]);

  // Auto-expand the year containing current selection on first load or when records change
  useEffect(() => {
    if (currentRecord) {
      const currentThaiYear = currentRecord.thaiYear || (currentRecord.year > 2400 ? currentRecord.year : currentRecord.year + 543);
      setExpandedYears(prev => new Set(prev).add(currentThaiYear));
    } else if (groupedByYear.length > 0) {
      setExpandedYears(prev => new Set(prev).add(groupedByYear[0].thaiYear));
    }
  }, [currentRecord, groupedByYear]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleYear = (thaiYear: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(thaiYear)) {
        next.delete(thaiYear);
      } else {
        next.add(thaiYear);
      }
      return next;
    });
  };

  const expandAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedYears(new Set(groupedByYear.map(g => g.thaiYear)));
  };

  const collapseAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedYears(new Set());
  };

  const handleSelect = (recordId: string) => {
    onSelectRecord(recordId);
    setIsOpen(false);
  };

  if (records.length === 0) {
    return (
      <span className="text-xs text-gray-400 italic">ไม่พบประวัติงวดเงินเดือน</span>
    );
  }

  return (
    <div className="relative inline-block text-left z-30" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 h-9 px-3 bg-gray-50 hover:bg-white border border-gray-300 hover:border-emerald-500 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs transition-all cursor-pointer min-w-[230px] focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">
            {currentRecord ? currentRecord.label : "เลือกงวดเงินเดือน..."}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-gray-400">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-emerald-600" : ""}`} />
        </div>
      </button>

      {/* Tree Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-[310px] sm:w-[350px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls */}
          <div className="p-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11.5px] font-bold text-gray-800">โครงสร้างงวดเงินเดือน (Tree View)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={expandAll}
                className="text-[10px] text-gray-500 hover:text-emerald-700 font-medium px-1.5 py-0.5 rounded hover:bg-gray-200/70 transition-colors cursor-pointer"
                title="ขยายทุกปี"
              >
                + ขยายทั้งหมด
              </button>
              <span className="text-gray-300 text-xs">|</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[10px] text-gray-500 hover:text-red-700 font-medium px-1.5 py-0.5 rounded hover:bg-gray-200/70 transition-colors cursor-pointer"
                title="ย่อทุกปี"
              >
                - ย่อทั้งหมด
              </button>
            </div>
          </div>

          {/* Tree View List */}
          <div className="max-h-[320px] overflow-y-auto p-2 space-y-1 text-xs">
            {groupedByYear.map((group) => {
              const isExpanded = expandedYears.has(group.thaiYear);
              const hasSelectedChild = group.records.some(r => r.id === selectedRecordId);

              return (
                <div key={group.thaiYear} className="space-y-0.5 rounded-lg border border-gray-100 bg-gray-50/30 overflow-hidden">
                  {/* Year Parent Node */}
                  <div
                    onClick={() => toggleYear(group.thaiYear)}
                    className={`flex items-center justify-between px-2.5 py-2 cursor-pointer transition-colors select-none ${
                      hasSelectedChild ? "bg-emerald-50/50" : "hover:bg-gray-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Plus / Minus Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleYear(group.thaiYear, e)}
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border transition-colors cursor-pointer ${
                          isExpanded 
                            ? "bg-emerald-100 border-emerald-300 text-emerald-800" 
                            : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {isExpanded ? <Minus className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                      </button>

                      {/* Folder Icon */}
                      {isExpanded ? (
                        <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      )}

                      <span className="font-bold text-gray-900 text-xs">
                        ปี พ.ศ. {group.thaiYear} ({group.year})
                      </span>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-medium bg-white text-gray-600 border-gray-200">
                      {group.records.length} งวด
                    </Badge>
                  </div>

                  {/* Children Records (Leaves) */}
                  {isExpanded && (
                    <div className="pl-6 pr-1 py-1 space-y-1 bg-white border-t border-gray-100">
                      {group.records.map((rec, rIdx) => {
                        const isSelected = rec.id === selectedRecordId;
                        const roundNum = rec.round || 1;
                        const roundLabel = rec.roundName || (roundNum === 1 ? 'รอบปกติ' : `งวดที่ ${roundNum}`);

                        return (
                          <div
                            key={rec.id}
                            onClick={() => handleSelect(rec.id)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-all relative group ${
                              isSelected
                                ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs"
                                : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                            }`}
                          >
                            {/* Branch connector visual hint */}
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-gray-300 font-mono text-[10px]">├─</span>
                              <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} />
                              <div className="truncate">
                                <span className="text-[11.5px] block truncate">
                                  {rec.monthName} {rec.thaiYear}
                                </span>
                                {rec.roundName && (
                                  <span className="text-[9.5px] text-gray-400 block truncate font-normal">
                                    {rec.roundName}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
