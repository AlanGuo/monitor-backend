// @ts-ignore
import config from "config";
// @ts-ignore
import cfsign from "aws-cloudfront-sign";

export async function getSignedUrl(key: string) {
  const signingParams = {
    keypairId: config.AWS_CLOUDFRONT.keyPairId,
    // Optional - this can be used as an alternative to privateKeyString
    privateKeyPath: "config/cloudfront/pk-APKAJH6JUHUQ35LPLWOA.pem",
    expireTime: Date.now() + config.AWS_CLOUDFRONT.timeLimit
  }
  
  // Generating a signed URL
  const signedUrl = cfsign.getSignedUrl(
    `${config.AWS_CLOUDFRONT.url}${key}`, 
    signingParams
  );

  return signedUrl;
}