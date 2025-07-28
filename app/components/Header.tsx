import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { Button } from "@/components/ui/button"
import { User, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "i18next"
import LanguageSwitcher from "./LanguageSwitcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, Heart, LogOut } from "lucide-react"

const Header = () => {
  const { t, i18n } = useTranslation()
  const language = i18n.language

  return (
    <div className="fixed w-full h-16 bg-background/95 z-50 backdrop-blur-md border-b">
      <div className="container h-full flex items-center justify-between">
        <p className="font-bold text-xl">Acme</p>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ModeToggle />
          {/* User Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                {language === "th" ? "โปรไฟล์" : "Profile"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {language === "th" ? "คำสั่งซื้อของฉัน" : "My Orders"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="w-4 h-4 mr-2" />
                {language === "th" ? "รายการโปรด" : "Wishlist"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/login">
                  <Shield className="w-4 h-4 mr-2" />
                  {language === "th" ? "เข้าสู่ระบบผู้ดูแล" : "Admin Panel"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" />
                {language === "th" ? "ออกจากระบบ" : "Sign Out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our
                  servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}

export default Header
