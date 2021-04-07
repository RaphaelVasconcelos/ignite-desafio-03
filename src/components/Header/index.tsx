import Link from 'next/link';
import header from './header.module.scss';

export default function Header() {
  return (
    <Link href="/">
      <img className={header.logo} src="/images/Logo.svg" alt="logo" />
    </Link>
  );
}
