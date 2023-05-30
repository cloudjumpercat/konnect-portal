export const en = {
  login: {
    unauthenticated: 'Account could not be authenticated. If you think you are receiving this message in error, please contact your administrator.',
    successText: 'Your email has been confirmed. Awaiting account approval.',
    successButton: 'Okay',
    missingCredentials: 'Please enter your login credentials',
    missingAccount: "Don't have an account?",
    signUp: 'Sign Up'
  },
  forgotPassword: {
    successText: 'Check your email for a link to reset your password. If it doesn’t appear within a few minutes, please check your spam folder.',
    successButton: 'Return to home page',
    heading: 'Recover Password',
    subHeading: "Enter your user account's verified email address and we will send you a password reset link.",
    placeholderEmail: 'Email',
    buttonIdle: 'Send password reset email',
    buttonSubmitting: 'Submitting',
    missingEmail: 'Please enter your email address'
  },
  resetPassword: {
    successText: 'Password reset successfully.',
    successButton: 'Return to login',
    heading: 'Change Password',
    placeholderPassword: 'Password',
    placeholderConfirmPassword: 'Confirm Password',
    buttonIdle: 'Change Password',
    buttonSubmitting: 'Submitting',
    confirmPasswordFail: 'Passwords must match',
    missingPassword: 'Passwords are required'
  },
  registration: {
    successText: 'Please check your email to confirm your address.',
    alreadyCreated: 'Already have an account?',
    login: 'Log in here'
  },
  productVersion: {
    deprecatedWarning: (flagEnabled?: boolean) => `This ${flagEnabled ? 'product' : 'service'} version is now deprecated. The endpoints will remain fully usable until this version is sunsetted.`,
    unableToRetrieveDoc: 'Unable to retrieve documentation'
  },
  userDropdown: {
    myApps: 'My Apps',
    logout: 'Logout'
  },
  sectionOverview: {
    title: 'Overview'
  },
  viewSpecModal: {
    viewSpec: 'View Spec',
    copy: 'Copy',
    download: 'Download',
    close: 'Close',
    copySuccess: 'Copied to clipboard',
    copyError: 'Failed to copy id to clipboard'
  },
  credentials: {
    noCredentialsText: 'No Credentials',
    title: 'Authentication',
    newButtonText: 'Generate Credential',
    copySubheading: (displayName: string) => `Credential for ${displayName}`,
    creationModal: {
      title: 'Name for the credential',
      continueButton: 'Generate',
      inputLabel: 'Name',
      inputPlaceholder: 'Provide a name for this credential',
      cancelButton: 'Cancel'
    },
    revokeModal: {
      title: 'Revoke the credential',
      description: (credentialKeyLabel: string) => `Key '${credentialKeyLabel}' will be revoked, you cannot undo this action.`,
      revokeButton: 'Revoke',
      cancelButton: 'Cancel'
    },
    renameModal: {
      actionLabel: 'Edit',
      title: 'Edit name for the credential',
      continueButton: 'Save',
      inputLabel: 'Name',
      inputPlaceholder: 'Provide a new name for this credential',
      cancelButton: 'Cancel'
    },
    copyModal: {
      title: 'Copy credential',
      continueButton: 'Confirm & Copy',
      copyButtonLabel: 'Credential: ',
      cancelButton: 'Cancel',
      hiddenCredentialsText: 'You will only be able to copy this credential once. Please copy and store it somewhere safe.'
    }
  },
  application: {
    edit: 'Edit',
    cancel: 'Cancel',
    delete: 'Delete',
    proceed: 'Proceed',
    applicationName: 'Application Name ',
    clientID: 'Client ID: ',
    clientSecret: 'Client Secret: ',
    reqField: ' indicates required field',
    redirectUriLabel: 'Redirect URI',
    applicationCredentials: 'Application Credentials',
    applicationSecret: 'Application Secret',
    confirmDelete: (name: any) => `Are you sure you want to delete ${name}? This action cannot be undone`,
    description: 'Description',
    redirectUri: (uri: string) => `Redirect URI: ${uri}`,
    referenceId: (id: string) => `Reference ID: ${id}`,
    form: {
      referenceId: {
        label: 'Reference ID',
        help: 'Must match with the client ID of the application entity in your identity provider when using OpenID',
        placeholder: 'Enter or generate an ID',
        generate: 'Generate'
      }
    },
    headerDescription1: 'Here is the client information for your application named ',
    headerDescription2: '. The client secret will ',
    headerDescription3: 'only be shown once.',
    headerDescription4: 'Please copy this value and keep for your records.'
  },
  productList: (flagEnabled:boolean) => ({
    title: flagEnabled ? 'Products' : 'Services',
    actions: {
      unregister: 'Unregister'
    },
    emptyState: {
      title: `No ${flagEnabled ? 'Products' : 'Services'}`,
      viewCatalog1: 'View the catalog',
      viewCatalog2: `to register to a ${flagEnabled ? 'product' : 'service'}.`
    }
  }),
  dcrAuthentication: {
    authentication: 'Authentication',
    refreshToken: 'Refresh Token'
  },
  refreshTokenModal: {
    title: 'Application Secret',
    proceed: 'Proceed',
    description1: 'Here is new secret for your application. The client secret will ',
    description2: 'only be shown once. ',
    description3: 'Please copy this value and keep for your records.',
    secret: 'Secret: '
  },
  applicationRegistration: {
    noAvailableApplications: 'You currently have no applications to register.',
    noApplications: 'No Applications',
    selectApplication: 'Select Application',
    createNewApplication: 'Create new Application +',
    createApplication: 'Create an Application',
    cancelButton: 'Cancel',
    registeredApplications: (flagEnabled: boolean) => `The following applications are already registered to this ${flagEnabled ? 'product' : 'service'}:`,
    modalApplicationRegistrationDefault: {
      title: (serviceName: string, serviceVersion: string) => `Register for ${serviceName} - ${serviceVersion}`,
      buttonText: 'Request Access'
    },
    modalApplicationRegistrationStatusIsPending: {
      title: 'Registration Under Review',
      body: 'You will be notified upon approval.',
      buttonText: 'Close'
    }
  },
  defaultForm: {
    missingFields: 'Please complete all required fields'
  },
  validationErrors: {
    isEmail: 'Email must be a valid email address'
  },
  apiDocumentation: {
    error: {
      description: 'An unexpected error occurred when trying to load the requested document. Please try again later',
      linkText: 'Go back home →'
    },
    sections: {
      onThisPage: 'On this page'
    }
  },
  sidebar: {
    deprecated: ' (Deprecated)',
    noResults: (flagEnabled: boolean) => `No ${flagEnabled ? 'product' : 'service'} versions`
  },
  catalog: {
    entity: (flagEnabled: boolean) => `${flagEnabled ? 'Product' : 'Service'}`,
    noResults: 'No Products listed'
  },
  catalogItem: {
    latestVersion: 'Latest Version:',
    specificationLink: 'Specification',
    documentationLink: 'Documentation'
  },
  catalogTable: {
    specificationLink: 'Specification',
    documentationLink: 'Documentation'
  },
  products: {
    search: 'Search',
    searching: 'Searching...'
  },
  copyButton: {
    clickToCopy: 'Click to copy',
    copyToClipboard: 'Copy to clipboard',
    ariaLabel: 'Copy button content to clipboard',
    failedToCopy: (textToCopy: string) => `Failed to copy ${textToCopy} to clipboard`,
    copiedToClipboard: (textToCopy: string) => `"${textToCopy}" copied to clipboard`

  },
  nav: {
    catalog: 'Catalog',
    logoAlt: 'logo'
  },
  authCard: {
    logoAlt: 'logo'
  },
  forbidden: {
    http403: '403',
    goBack: 'Go back',
    sorryMessage: 'Sorry. You are not authorized to view this page.',
    home: 'home'
  },
  notFound: {
    http404: '404',
    goBack: 'Go back',
    sorryMessage: 'Sorry. We cannot find the page you are looking for.',
    home: 'home',
    logoAlt: 'logo'
  },
  myApp: {
    newApp: 'New App',
    plus: 'Plus',
    myApps: 'My Apps',
    refreshSecret: 'Refresh secret',
    delete: 'Delete',
    cancel: 'Cancel',
    noApp: 'No Applications',
    create: 'Create a new app',
    getStarted: ' to get started',
    deleteDialog: (name: string) => `Are you sure you want to delete ${name}? This action cannot be undone.`
  }
}
