import Image from 'next/image'
import { SigninButton } from '../signinButton';
import styles from './styles.module.scss';
import { ActiveLink } from '../activeLink';

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
					<ActiveLink activeClassName={styles.active} href="/">
						<a>Home</a>
					</ActiveLink >
					<ActiveLink activeClassName={styles.active} href="/posts">
						<a>Posts</a>
					</ActiveLink>
				</nav>

				<SigninButton />
			</div>
		</header>
	);
}
