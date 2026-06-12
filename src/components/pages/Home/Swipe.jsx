import { Swiper, SwiperSlide } from 'swiper/react';
// IMPORTANTE: Adicionado o 'Pagination' aqui nos módulos nativos do swiper
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import styles from './SwiperContainer.module.css';
import Image from './Imgs/img1.png';
import Image2 from './Imgs/Olimpiada.png';
import Image3 from './Imgs/img3.png';
import Image4 from './Imgs/img4.png';
import { useState, useEffect } from 'react';

// Importações obrigatórias de estilos globais do Swiper (garanta que seu projeto já tenha ou mantenha as existentes)
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Swipe() {
  const [slidePerView, setSlidePerView] = useState(1);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 720) {
        setSlidePerView(1);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.swiper_wrapper_box}>
      <Swiper 
        className={styles.swiper_container}
        modules={[Navigation, Autoplay, Pagination]} // Adicionado Pagination aqui
        spaceBetween={50}
        slidesPerView={slidePerView}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }} 
      >
        <SwiperSlide className={styles.slide_image}>
          <img src={Image} alt="Destaque 1" />
        </SwiperSlide>
        <SwiperSlide className={styles.slide_image}>
          <img src={Image2} alt="Olimpíada UNEMAT" />
        </SwiperSlide>
        <SwiperSlide className={styles.slide_image}>
          <img src={Image3} alt="Destaque 3" />
        </SwiperSlide>
        <SwiperSlide className={styles.slide_image}>
          <img src={Image4} alt="Destaque 4" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default Swipe;