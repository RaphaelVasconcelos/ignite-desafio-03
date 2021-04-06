import { GetStaticProps } from 'next';
import Head from 'next/head';
import {AiOutlineCalendar} from 'react-icons/ai'
import {FiUser} from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <main className={commonStyles.container}>
        <img className={commonStyles.logo} src="/images/Logo.svg" alt="logo" />
        <div className={styles.post}>
          <header className={styles.title}>Como Utilizar Hooks</header>
          <p className={styles.subtitle}>
            Pensando em sincronização em ciclos de vida
          </p>
          <div className={styles.info}>
            <span><AiOutlineCalendar/>Data</span><span><FiUser/>Author</span>
          </div>
        </div>
        <div className={styles.post}>
          <header className={styles.title}>Como Utilizar Hooks</header>
          <p className={styles.subtitle}>
            Pensando em sincronização em ciclos de vida
          </p>
          <div className={styles.info}>
            <span><AiOutlineCalendar/>Data</span><span><FiUser/>Author</span>
          </div>
        </div>
        <div className={styles.post}>
          <header className={styles.title}>Como Utilizar Hooks</header>
          <p className={styles.subtitle}>
            Pensando em sincronização em ciclos de vida
          </p>
          <div className={styles.info}>
            <span><AiOutlineCalendar/>Data</span><span><FiUser/>Author</span>
          </div>
        </div>

        <a className={styles.loadMore}>Carregar mais posts</a>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
