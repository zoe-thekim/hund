import aboutImage from '../../assets/about_image.png'

const About = () => {
  return (
    <section className="bg-[#ececec] text-[#111111]">
      <div className="mx-auto max-w-[1200px] px-6 pb-14 pt-12 md:px-10 md:pt-16">
        <div className="max-w-[420px]">
          <h1
            className="text-[64px] leading-[0.95] tracking-[-0.03em] md:text-[84px]"
            style={{ fontFamily: '"Mighty Courage", Georgia, serif' }}
          >
            hi yall
          </h1>
          <p className="mt-5 text-[17px] font-semibold leading-snug md:text-[20px]">
            this is me and my owner zoe !
            <br />
            i don&apos;t know how you get here but let me talk to you some of my stories
          </p>
        </div>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[420px_1fr] md:gap-12 lg:grid-cols-[460px_1fr]">
          <div className="self-end">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-[#d8d8d8]">
              <img
                src={aboutImage}
                alt="Owner and dog portrait"
                className="h-full w-full object-cover object-[20%_86%]"
              />
            </div>
          </div>

          <div className="space-y-14 text-[14px] font-semibold leading-[1.35] md:space-y-16 md:text-[20px] lg:text-[20px]">
            <p className="max-w-[820px]">
              i moved five times till i turn to five months. maybe i&apos;m too active or hairy? i don&apos;t know
              <br />
              but consequence is important. I met my family and found forever home
              <br />
              when I turn to five years old, i got heartwarm disease class 3. i struggled and healed now
              <br />
              <br />
              wasn&apos;t easy all time in my life but i&apos;m happy to meet my family and the time i spend these days
            </p>

            <p className="max-w-[700px]">oh you still here ! thank you for listening to me :)</p>

            <p className="max-w-[900px] text-right">
              these days i&apos;m attending school. so i&apos;m trying to dress up well,, you know tpo is important
              <br />
              but since i got a unique body size, it&apos;s not easy to find perfect clothes for me
              <br />
              <br />
              and i know, some of you are just like me
              <br />
              so i force zoe to make this to share my october-picked clothes !
              <br />
              <br />
              please enjoy the hund collection
              <br />
              dedicate to all long bodies
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
