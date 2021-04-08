import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import { FiClock } from 'react-icons/fi';
import { AiOutlineCalendar } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  function readingTime(text) {
    const time = text.reduce(function (accumulator, currentValue) {
      const text = `${currentValue.heading} ${RichText.asText(
        currentValue.body
      )}`;
      return accumulator + Math.ceil(text.split(' ').length / 200);
    }, 0);

    return `${time} min`;
  }

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Header />
      <div className={commonStyles.container}>
        <img src={post.data.banner.url} alt="banner" width="700" />
        <div className={styles.title}>{post ? post.data.title : ''}</div>
        <div className={styles.info}>
          <AiOutlineCalendar />
          <span>
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <FiUser />
          <span>{post ? post.data.author : ''}</span>
          <FiClock />
          <span>{post ? readingTime(post.data.content) : ''}</span>
        </div>
        <main className={styles.content}>
          {post?.data?.content?.map(group => (
            <div key={group.heading}>
              <h2>{group.heading}</h2>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(group.body),
                }}
              />
            </div>
          ))}
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'desafio03-bl'),
  ]);

  const paths = postsResponse.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('desafio03-bl', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: response.data,
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 mins
  };
};
