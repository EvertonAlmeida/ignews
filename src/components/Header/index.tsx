import Link from 'next/link'
import Image from 'next/image'
import { SigninButton } from '../signinButton';
import styles from './styles.module.scss';

export const Header = () => {
	return (
		<header className={styles.headerContainer}>
			<div className={styles.headerContent}>
			<Image
				src="/images/logo.svg"
        		alt="ig.news"
        		width={110}
        		height={31}
      		/>
				<nav>
					<Link href="/">
						<a className={styles.active}>Home</a>
					</Link>
					<Link href="/posts">
						<a >Posts</a>
					</Link>
				</nav>

				<SigninButton />
			</div>
		</header>
	);
}
