import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ImageSlider = () => {
  const images = [
    "/Image3.jpg", 
    "/Image3.jpg",
    "/Image3.jpg",
    "/Image3.jpg"
  ];

  return (
    <div className="swiper-container">
      <Swiper
        className="swiper-container"
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000 }}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`Slide ${index + 1}`}
              className="slider-image"
            />
          </SwiperSlide>
        ))}

        {/* Navigation Arrows */}
        <div className="swiper-nav swiper-button-prev-custom">
          <FaChevronLeft size={24} />
        </div>
        <div className="swiper-nav swiper-button-next-custom">
          <FaChevronRight size={24} />
        </div>
      </Swiper>
    </div>
  );
};

export default ImageSlider;
