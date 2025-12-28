import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Hakkımızda</h1>
            <p className="text-xl text-gray-600">Live your own legend in legendary cities</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Tarihçemiz</h2>
            <p className="text-gray-700 mb-4">
              Legend Cities, 1962 yılında Avustralya'nın Melbourne şehrinde kurulmuş olup, 
              o günden bu yana gayrimenkul sektöründe güvenilir ve profesyonel hizmet sunmaktadır. 
              63 yılı aşkın deneyimimizle, müşterilerimize en iyi gayrimenkul çözümlerini sunuyoruz.
            </p>
            <p className="text-gray-700">
              Türkiye'de Nisbetiye Mahallesi, Etiler'deki merkez ofisimiz başta olmak üzere 
              binlerce mutlu müşteri ve başarılı işlem gerçekleştirerek sektörde öncü bir konum elde ettik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Misyonumuz</h2>
              <p className="text-gray-700">
                Müşterilerimizin gayrimenkul ihtiyaçlarını en üst düzeyde karşılamak için profesyonel ve 
                güvenilir hizmet sunmak, müşteri odaklı bir yaklaşımla kişiselleştirilmiş çözümler üretmek 
                ve yenilikçi yöntemler kullanarak sektöre değer katmak.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Vizyonumuz</h2>
              <p className="text-gray-700">
                Müşterilere benzersiz gayrimenkul deneyimleri sunarak sektörde öncü olmak ve 
                gayrimenkul ihtiyaçlarını karşılayarak şehirleri efsanevi birer yaşam alanına dönüştürmek.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Temel Prensiplerimiz</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Profesyonel ve Güvenilir Hizmet',
                'Müşteri Odaklı Yaklaşım',
                'Yenilikçi Çözümler',
                'Topluma Değer Katma',
                'Sürekli Eğitim ve Gelişim',
                'Kaliteli Hizmet',
                'Uzun Vadeli İlişkiler',
              ].map((principle, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="text-red-600 mr-2 text-xl">✓</span>
                  {principle}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-red-600 to-gray-900 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Neden Legend Cities?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div>
                <div className="text-4xl font-bold mb-2">63</div>
                <div>Yıllık Deneyim</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5000+</div>
                <div>Mutlu Müşteri</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">150+</div>
                <div>Aktif İlan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
