import { EffectComposer, Bloom, Vignette, ToneMapping, SSAO } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export default function PostProcessing() {
  return (
    <EffectComposer>
      <SSAO 
        samples={31} 
        radius={10} 
        intensity={20} 
        luminanceInfluence={0.5} 
      />
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.9} 
        intensity={0.8} 
        mipmapBlur 
      />
      <Vignette eskil={false} offset={0.5} darkness={0.5} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
