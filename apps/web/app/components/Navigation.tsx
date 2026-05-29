import Link from 'next/link';

export default function Navigation() {
  return (
      <nav>
        <img></img>
        <Link href="/characters">Персонажи</Link>
        <Link href="/universes">Вселенные</Link>
        <input type="text" id="search" name="search" />
        <Link href="/characters/create">Создать персонажа</Link>
        <img className="w-8 h-8 rounded-full border border-solid border-black-600" />
      </nav>
  );
}