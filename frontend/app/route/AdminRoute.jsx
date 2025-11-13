import { ProtectedRoute } from "../context/protectedRoute";


export const AdminRoute = ({ children }) => {
  return <ProtectedRoute roles={["admin"]}>{children}</ProtectedRoute>;
};