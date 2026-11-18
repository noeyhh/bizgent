import { createBrowserRouter } from "react-router"
import { PublicOnly, RequireAuth, RouteFallback } from "./AuthGuard"
import { AppLayout } from "../layouts/AppLayout"
import { WizardLayout } from "../layouts/WizardLayout"
import { PlaceholderPage } from "../pages/PlaceholderPage"
import { HomePage } from "../pages/HomePage"
import { CampaignsPage } from "../pages/CampaignsPage"
import { InsightsPage } from "../pages/InsightsPage"
import { StorePage } from "../pages/StorePage"
import { PerformancePage } from "../pages/PerformancePage"
import { SubscriptionPage } from "../pages/SubscriptionPage"
import { GoalStepPage } from "../pages/wizard/GoalStepPage"
import { PlanStepPage } from "../pages/wizard/PlanStepPage"
import { ContentStepPage } from "../pages/wizard/ContentStepPage"
import { ImageStepPage } from "../pages/wizard/ImageStepPage"
import { CompareStepPage } from "../pages/wizard/CompareStepPage"
import { PublishStepPage } from "../pages/wizard/PublishStepPage"
import { WizardPlaceholderPage } from "../pages/WizardPlaceholderPage"
import { LandingPage } from "../pages/LandingPage"
import { LoginPage } from "../pages/LoginPage"
import { SignupPage } from "../pages/SignupPage"

const appPages = [
  {
    index: true,
    title: "홈",
    description: "오늘의 매장과 캠페인 현황을 확인하는 공간입니다.",
  },
  {
    path: "store",
    title: "매장 정보 관리",
    description: "AI가 활용할 매장 정보를 관리하는 공간입니다.",
  },
  {
    path: "campaigns",
    title: "캠페인 보관함",
    description: "저장하거나 게시한 캠페인을 모아보는 공간입니다.",
  },
  {
    path: "performance",
    title: "성과분석",
    description: "캠페인과 매출 성과를 분석하는 공간입니다.",
  },
  {
    path: "insights",
    title: "AI 캠페인 개선 방향",
    description: "AI가 제안하는 다음 캠페인 개선 방향을 확인하는 공간입니다.",
  },
  {
    path: "subscription",
    title: "구독 관리 및 크레딧",
    description: "이용 중인 요금제와 크레딧을 관리하는 공간입니다.",
  },
]

const wizardPages = [
  { path: "1", title: "목표 설정", stepLabel: "1단계" },
  { path: "2", title: "AI 기획", stepLabel: "2단계" },
  { path: "3-1", title: "콘텐츠 설정", stepLabel: "3단계" },
  { path: "3-2", title: "이미지 설정", stepLabel: "3단계 이미지 설정" },
  { path: "4", title: "시안 비교", stepLabel: "4단계" },
  { path: "5", title: "게시", stepLabel: "5단계" },
]

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: appPages.map(({ index, path, title, description }) => ({
      index,
      path,
      element: index ? (
        <HomePage />
      ) : path === "subscription" ? (
        <SubscriptionPage />
      ) : path === "performance" ? (
        <PerformancePage />
      ) : path === "store" ? (
        <StorePage />
      ) : path === "campaigns" ? (
        <CampaignsPage />
      ) : path === "insights" ? (
        <InsightsPage />
      ) : (
        <PlaceholderPage title={title} description={description} />
      ),
    })),
  },
  {
    path: "/campaigns/new",
    element: (
      <RequireAuth>
        <WizardLayout />
      </RequireAuth>
    ),
    children: wizardPages.map(({ path, title, stepLabel }) => ({
      path,
      element:
        path === "1" ? (
          <GoalStepPage />
        ) : path === "2" ? (
          <PlanStepPage />
        ) : path === "3-1" ? (
          <ContentStepPage />
        ) : path === "3-2" ? (
          <ImageStepPage />
        ) : path === "4" ? (
          <CompareStepPage />
        ) : path === "5" ? (
          <PublishStepPage />
        ) : (
          <WizardPlaceholderPage title={title} stepLabel={stepLabel} />
        ),
    })),
  },
  {
    path: "/landing",
    element: (
      <PublicOnly>
        <LandingPage />
      </PublicOnly>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicOnly>
        <SignupPage />
      </PublicOnly>
    ),
  },
  {
    path: "*",
    element: <RouteFallback />,
  },
])
