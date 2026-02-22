"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/select", label: "選択", icon: "🎨" },
  { href: "/collection", label: "コレクション", icon: "📚" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-[#0F0F13]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition ${
                isActive ? "text-violet-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
