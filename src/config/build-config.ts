export interface BuildConfig {
  readonly AWS_ACCOUNT_ID: string;
  readonly AWS_PROFILE_NAME: string;
  readonly AWS_PROFILE_REGION: string;

  STAGE_NAME: string;
}
