import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-yellow-400 mb-2">{t('notFound.title')}</h1>
      <p className="mb-4">{t('notFound.message')}</p>
      <Link to="/" className="underline text-yellow-400">{t('notFound.goHome')}</Link>
    </div>
  );
}

export default NotFoundPage;