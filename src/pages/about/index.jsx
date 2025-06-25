import Roaster from "../../assets/images/roaster.jpg"

export default function About() {
  return (
    <section className="h-screen">
      <div className="relative flex items-center justify-center h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${Roaster})` }}>
        <div className="relative bg-white bg-opacity-90 backdrop-blur-sm p-4 md:p-8 max-w-md shadow-2xl"
          style={{
            clipPath: 'path("M 10,20 L 60,20 L 120,20 A 10,10 0,0,0 130,10 L 130,10 A 10,10 0,0,1 140,0 L 300,0 A 10,10 0,0,1 310,10 L 310,190 L 300,200 L 10,200 L 0,190 L 0,30 A 10,10 0,0,1 10,20 Z")'
          }}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-right">
            About
            <br />
            Workspace
          </h1>
        </div>
      </div>
    </section>
  );
}