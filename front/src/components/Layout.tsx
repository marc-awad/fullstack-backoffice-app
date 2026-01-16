// components/Layout.tsx
import { ReactNode } from "react"
import Header from "./Header"
import "../style/Layout.css"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p>
            &copy; {new Date().getFullYear()} E-commerce. Tous droits réservés.
          </p>
          <div className="footer-links">
            <a href="/about">À propos</a>
            <a href="/contact">Contact</a>
            <a href="/legal">Mentions légales</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
