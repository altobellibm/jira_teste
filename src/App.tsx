import { Navigate, RouterProvider, createHashRouter } from 'react-router';
import { incidente, mudanca } from './forms/definitions';
import FormPage from './pages/FormPage';
import ProblemPage from './pages/ProblemPage';
import RequestPage from './pages/RequestPage';

// Roteamento por hash (#/incidente): funciona em qualquer hospedagem estática, como o GitHub Pages.
// Estes caminhos são os links dos cartões do Confluence.
const router = createHashRouter([
  { path: '/', element: <Navigate to="/requisicao" replace /> },
  { path: '/incidente', element: <FormPage key="incidente" form={incidente} /> },
  { path: '/requisicao', element: <RequestPage /> },
  { path: '/problema', element: <ProblemPage /> },
  { path: '/mudanca', element: <FormPage key="mudanca" form={mudanca} /> },
  { path: '*', element: <Navigate to="/requisicao" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
