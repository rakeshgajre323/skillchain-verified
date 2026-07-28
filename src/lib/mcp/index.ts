import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listMyCredentials from "./tools/list-my-credentials";
import getCredential from "./tools/get-credential";
import listCredentialRequests from "./tools/list-credential-requests";
import createCredentialRequest from "./tools/create-credential-request";
import listInstitutes from "./tools/list-institutes";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "origincerti-mcp",
  title: "OriginCerti Credentials",
  version: "0.1.0",
  instructions:
    "Tools for OriginCerti, a digital academic credentials platform (students, institutes and companies). Use `get_my_profile` to learn the signed-in user's role, `list_my_credentials` and `get_credential` to read issued credentials, `list_institutes` to find an institute's issuer_id, and `list_credential_requests` / `create_credential_request` to track or raise credential issuance requests. All data is scoped to the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    listMyCredentials,
    getCredential,
    listCredentialRequests,
    createCredentialRequest,
    listInstitutes,
  ],
});
