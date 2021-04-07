import { GetStaticProps } from 'next';
import Head from 'next/head';

import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';
import Link from 'next/link';

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

export default function Home({ postsPagination }: HomeProps) {
  const [results, setResults] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNewPosts() {
    const response = await fetch(nextPage).then(response => response.json());

    const newResults = [...results, ...response.results];

    if (response.next_page) {
      setNextPage(response.next_page);
    } else {
      setNextPage(null);
    }

    setResults(newResults);
  }

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <main className={commonStyles.container}>
        <img className={commonStyles.logo} src="/images/Logo.svg" alt="logo" />
        {results.map(post => (
          <div className={styles.post} key={post.uid}>
            <Link href={`/posts/${post.uid}`}>
              <a>
                <header className={styles.title}>{post.data.title}</header>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <span>
                    <AiOutlineCalendar />
                    {post.first_publication_date}
                  </span>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          </div>
        ))}

        {nextPage ? (
          <a onClick={handleNewPosts} className={styles.loadMore}>
            Carregar mais posts
          </a>
        ) : null}
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'desafio03-bl')],
    {
      pageSize: 25,
    }
  );

  const next_page = postsResponse.next_page;
  const results = postsResponse.results;

  return {
    props: {
      postsPagination: {
        results,
        next_page,
      },
    },
  };
};
