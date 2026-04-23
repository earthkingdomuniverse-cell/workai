/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/forgot-password` | `/(auth)/login` | `/(auth)/signup` | `/(onboarding)` | `/(onboarding)/goals-setup` | `/(onboarding)/intro` | `/(onboarding)/profile-setup` | `/(onboarding)/role-select` | `/(onboarding)/skills-setup` | `/(tabs)` | `/(tabs)/activity` | `/(tabs)/admin` | `/(tabs)/ai` | `/(tabs)/deals` | `/(tabs)/explore` | `/(tabs)/home` | `/(tabs)/inbox` | `/(tabs)/offers` | `/(tabs)/profile` | `/(tabs)/proposals` | `/(tabs)/requests` | `/_sitemap` | `/activity` | `/admin` | `/admin/disputes` | `/admin/fraud` | `/admin/overview` | `/admin/reviews` | `/admin/risk` | `/ai` | `/ai/match` | `/ai/next-action` | `/ai/price` | `/ai/support` | `/deals` | `/deals/create` | `/deals/dispute` | `/deals/payment` | `/deals/receipts` | `/deals/timeline` | `/explore` | `/forgot-password` | `/goals-setup` | `/home` | `/inbox` | `/intro` | `/login` | `/offers` | `/offers/create` | `/offers/edit` | `/offers/manage` | `/profile` | `/profile-setup` | `/proposals` | `/proposals/create` | `/proposals/mine` | `/requests` | `/requests/create` | `/requests/edit` | `/requests/manage` | `/role-select` | `/settings` | `/settings/account` | `/settings/appearance` | `/settings/notifications` | `/settings/privacy` | `/signup` | `/skills-setup` | `/transactions/history`;
      DynamicRoutes: `/deals/${Router.SingleRoutePart<T>}` | `/messages/${Router.SingleRoutePart<T>}` | `/offers/${Router.SingleRoutePart<T>}` | `/proposals/${Router.SingleRoutePart<T>}` | `/requests/${Router.SingleRoutePart<T>}` | `/transactions/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/deals/[id]` | `/messages/[id]` | `/offers/[id]` | `/proposals/[id]` | `/requests/[id]` | `/transactions/[id]`;
    }
  }
}
