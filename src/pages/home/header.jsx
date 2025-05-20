import { Image } from "antd";
import HeroBg from "../../assets/images/hero-bg.webp"
import Logo from "../../assets/images/white-company-logo.webp"

export default function Header() {
  return (
    <header className="relative flex items-center justify-center h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${HeroBg})` }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative flex flex-col items-center justify-center text-white z-10 text-center px-4">
        {/* <Image src={Logo} alt="Logo" width={200} height={200} preview={false} /> */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Homie Home Roaster</h1>
        <p className="text-xl md:text-2xl max-w-2xl">Crafting the perfect roast for exceptional coffee experiences</p>
      </div>
    </header>
  );
}