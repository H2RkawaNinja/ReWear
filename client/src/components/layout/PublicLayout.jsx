import Header from './Header';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-street-950">
      <Header />
      <main className="flex-grow pt-[98px]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
