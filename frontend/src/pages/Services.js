import React from 'react';

const Services = () => {
  const services = [
    {
      title: 'Konut Satış & Kiralama',
      description: 'Hayalinizdeki evi bulmanızda profesyonel destek sunuyoruz. Geniş portföyümüzle ihtiyaçlarınıza en uygun konutu bulmak için yanınızdayız.',
      features: ['Satılık konut', 'Kiralık konut', 'Danışmanlık', 'Hukuki destek']
    },
    {
      title: 'Ticari Alan Satış & Kiralama',
      description: 'İşletmeniz için ideal lokasyonda ticari alanlar. Ofis, mağaza, iş merkezi gibi çeşitli seçenekler.',
      features: ['Ofis alanları', 'Mağaza', 'İş merkezi', 'Depo ve lojistik alanlar']
    },
    {
      title: 'Arazi & Arsa Satışı',
      description: 'Yatırım fırsatları ve inaat projeleri için uygun arsalar. Detaylı piyasa analizi ile doğru yatırım kararı.',
      features: ['Konut arsası', 'Ticari arsa', 'Tarım arazisi', 'Yatırım danışmanlığı']
    },
    {
      title: 'Gayrimenkul Danışmanlığı',
      description: 'Uzman ekibimizle tüm gayrimenkul işlemlerinizde profesyonel destek. Piyasa analizi, değerleme ve yatırım danışmanlığı.',
      features: ['Piyasa analizi', 'Yatırım danışmanlığı', 'Hukuki süreç yönetimi', 'Finansman desteği']
    },
    {
      title: 'Yönetim Hizmetleri',
      description: 'Gayrimenkullerinizin profesyonel yönetimi. Kira tahsilatından bakım-onarıma kadar tüm hizmetler.',
      features: ['Kira yönetimi', 'Bakım-onarım', 'Kiracı ilişkileri', 'Mali raporlama']
    },
    {
      title: 'Değerleme',
      description: 'Güvenilir ve profesyonel gayrimenkul değerleme hizmetleri. Lisanslı değerleme uzmanlarımızla detaylı raporlar.',
      features: ['Piyasa değeri analizi', 'Yatırım değerlemesi', 'Sigorta değerlemesi', 'Resmi raporlar']
    },
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Hizmetlerimiz</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            1962'den beri gayrimenkul sektöründe sunduğumuz profesyonel hizmetler ile yanınızdayız
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <span className="text-red-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-red-600 to-gray-900 text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Daha Fazla Bilgi İster misiniz?</h2>
          <p className="mb-8 text-lg">Hizmetlerimiz hakkında detaylı bilgi almak için bize ulaşın</p>
          <a href="/contact" className="inline-block bg-white text-red-600 px-8 py-3 rounded hover:bg-gray-100 transition font-semibold">
            İletişime Geç
          </a>
        </div>
      </div>
    </div>
  );
};

export default Services;
