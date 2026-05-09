import { Route, Navigate } from "react-router-dom";

<Route path="/settings" element={<SettingsLayout />}>
  <Route index element={<Navigate to="profile" replace />} />
  <Route path="profile" element={<ProfileSettings />} />
  <Route path="change-password" element={<ChangePasswordSettings />} />
  <Route path="security" element={<SecuritySettings />} />
  <Route path="notifications" element={<NotificationsSettings />} />
  <Route path="danger-zone" element={<DangerZoneSettings />} />
</Route>