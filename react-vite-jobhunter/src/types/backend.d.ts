export interface IBackendRes<T> {
  error?: string | string[];
  message: string;
  statusCode: number | string;
  data?: T;
}

export interface IModelPaginate<T> {
  meta: {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export interface IAccount {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    age?: number;
    gender?: string;
    address?: string;
    balance: number;
    role: {
      id: string;
      name: string;
      active: boolean;
      permissions: {
        id: string;
        name: string;
        apiPath: string;
        method: string;
        module: string;
      }[];
    };
    company?: {
      id: string;
      name: string;
      logo: string;
    };
  };
}

export interface IGetAccount extends Omit<IAccount, "access_token"> {}

export interface ICompany {
  id?: string;
  name?: string;
  address?: string;
  logo: string;
  description?: string;
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISkill {
  id?: string;
  name?: string;
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  gender: string;
  address: string;
  balance: number;
  role?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
    name: string;
    logo: string;
  };
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IJob {
  id?: string;
  name: string;
  skills: ISkill[];
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string;
  startDate: Date;
  endDate: Date;
  active: boolean;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IResume {
  id?: string;
  email: string;
  url: string;
  status: string;
  companyName?: string;
  jobName?: string;
  user?: {
    id: string | number;
  };
  post?: {
    id: string | number;
  };
  history?: {
    status: string;
    updatedAt: Date;
    updatedBy: { id: string; email: string };
  }[];
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPermission {
  id?: string;
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IRole {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  permissions: IPermission[] | string[];

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubscribers {
  id?: string;
  name?: string;
  email?: string;
  skills: string[];
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPost {
  id?: string;
  title: string;
  content: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  applyCount?: number;
  job?: {
    id: string;
    name?: string;
    location?: string;
    salary?: number;
    quantity?: number;
    level?: string;
    description?: string;
    company?: {
      id: string;
      name: string;
      logo?: string;
    };
    skills?: ISkill[];
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
  user?: {
    id: string;
    email: string;
    name: string;
  };

  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Statistics {
  userStatistics: {
    totalUsers: number;
    usersByRole: Record<string, number>;
  };
  jobStatistics: {
    totalJobs: number;
    activeJobs: number;
    jobsByLocation: Record<string, number>;
    jobsByCompany: Record<string, number>;
    jobsByLevel: Record<string, number>;
  };
  resumeStatistics: {
    totalResumes: number;
    approvedResumes: number;
    pendingResumes: number;
    reviewingResumes: number;
    rejectedResumes: number;
    resumesByStatus: Record<string, number>;
  };
  skillStatistics: {
    topRequestedSkills: Array<{
      name: string;
      count: number;
      approvedCount: number;
    }>;
    topResumeSkills: Array<{
      name: string;
      count: number;
      approvedCount: number;
    }>;
    skillsByCategory: Record<string, number>;
  };
  transactionStatistics: {
    totalTransactions: number;
    transactionsByStatus: Record<string, number>;
    revenueByStatus: Record<string, number>;
    totalDepositRevenue: number;
    totalApplyFeeTransactions: number;
    totalApplyFeeAmount: number;
    totalPostFeeTransactions: number;
    totalPostFeeAmount: number;
    totalAvailableBalance: number;
  };
}

export interface ITransaction {
  id?: string;
  email: string;
  paymentRef: string;
  amount: number;
  paymentStatus: string;
  transactionType: string;
  user: {
    id: string | number;
    name: string;
  };
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}
