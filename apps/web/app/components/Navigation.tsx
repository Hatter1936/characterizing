import Link from 'next/link';
import logo from '../assets/images/logo.png';

export default function Navigation() {
  return (
      <nav className="h-12 px-28 flex flex-row items-center justify-between bg-[#9083B3] relative;">
        <div className="nav-div">
          <img className="h-12" src={logo.src} alt="Logo" />
          <Link href="/characters" className="nav-link">Персонажи</Link>
          <Link href="/universes" className="nav-link">Вселенные</Link>
        </div>
        <div className="nav-div">
          <input className="h-9 w-96" type="text" id="search" name="search" />
        </div>
        <div className="nav-div">
          <Link className="nav-button" href="/characters/create">Создать персонажа</Link>
          <img className="w-9 h-9 rounded-full border border-solid border-black-600" />
        </div>
      </nav>
  );
};