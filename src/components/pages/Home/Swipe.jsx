import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay} from 'swiper/modules';
import styles from './SwiperContainer.module.css';
import Image from './Imgs/img1.png'
import Image2 from './Imgs/Olimpiada.png'
import Image3 from './Imgs/img3.png'
import Image4 from './Imgs/img4.png'
import {useState, useEffect} from 'react'
function Swipe (){
  const [ slidePerView, setSlidePerView ] = useState(1)

  useEffect(() => {
    function handleResize(){
      if(window.innerWidth < 720){
        setSlidePerView(1)
      } 
    }

    handleResize();

    window.addEventListener('resize', handleResize)
  return () => {
    window.removeEventListener('resize', handleResize)
  }
  
  },[])

    return(
   <Swiper className={styles.swiper_container}

   modules={[Navigation, Autoplay]}
   spaceBetween={500}
   slidesPerView={slidePerView}
   navigation
   pagination={{ clickable: true }}
   
   onSwiper={(swiper) => console.log(swiper)}
   onSlideChange={() => console.log('slide change')}
   autoplay={{ delay: 5000, disableOnInteraction: false }} 
 >
    
    <SwiperSlide  className={styles.slide_image}>
        <img src={Image} alt="Img" />
    </SwiperSlide>
    <SwiperSlide  className={styles.slide_image}>
        <img src={Image2} alt="Img"/>
    </SwiperSlide>
    <SwiperSlide  className={styles.slide_image}>
        <img src={Image3} alt="Img"  />
    </SwiperSlide>
    <SwiperSlide  className={styles.slide_image}>
        <img src={Image4} alt="Img"/>
    </SwiperSlide>
    
    
 </Swiper>
      )
}
export default Swipe