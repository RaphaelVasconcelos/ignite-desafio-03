import Prismic from "@prismicio/client";
import { Document } from '@prismicio/client/types/documents';

// Client method to query from the Prismic repo
const Client = (req = null) =>
  Prismic.client(process.env.PRISMIC_API_ENDPOINT, createClientOptions(req, process.env.PRISMIC_ACCESS_TOKEN));

const createClientOptions = (req = null, prismicAccessToken = null) => {
  const reqOption = req ? { req } : {};
  const accessTokenOption = prismicAccessToken ? { accessToken: prismicAccessToken } : {};
  return {
    ...reqOption,
    ...accessTokenOption,
  };
};

const Preview = async (req, res) => {
  function linkResolver(doc: Document): string {
    if (doc.type === 'desafio03-bl') {
      return `/post/${doc.uid}`;
    }
    return '/';
  }
  const { token: ref, documentId } = req.query;
  const redirectUrl = await Client(req)
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, "/");

  if (!redirectUrl) {
    return res.status(401).json({ message: "Invalid token" });
  }

  res.setPreviewData({ ref });
  res.writeHead(302, { Location: `${redirectUrl}`  })
  res.end();
};

export default Preview;