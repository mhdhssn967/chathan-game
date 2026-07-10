Improve the visual quality of the React Three Fiber game using lightweight cinematic post-processing while maintaining excellent performance.

### Goals

The game should resemble:
- Little Nightmares
- INSIDE
- Shadow Fight
- Dark cinematic indie horror

Performance is more important than visual excess.

The effects should be subtle and atmospheric.

Never overdo any effect.

------------------------------------------------
Renderer
------------------------------------------------

Configure the renderer with:

- ACESFilmicToneMapping
- toneMappingExposure around 0.9–1.1
- SRGBColorSpace
- physicallyCorrectLights enabled
- high-performance renderer settings
- shadow map enabled using PCFSoftShadowMap

------------------------------------------------
Post Processing
------------------------------------------------

Use @react-three/postprocessing.

Enable:

✓ Bloom
- very low intensity
- only bright emissive objects should glow
- glowing eyes
- oil lamps
- moon reflections

✓ Vignette
- extremely subtle
- only darken the screen edges slightly

✓ Film Grain / Noise
- almost imperceptible
- just enough to remove digital perfection

✓ FXAA
- lightweight anti-aliasing
- prioritize performance

✓ Depth Fog
- exponential fog
- blue-grey
- hides distant geometry naturally
- increases atmosphere

✓ Chromatic Aberration
- almost invisible
- only around screen edges
- never distracting

------------------------------------------------
Conditional Effects
------------------------------------------------

SSAO should NOT always be enabled.

Implement a quality system:

Low
- Bloom
- Vignette
- FXAA
- Fog

Medium
- Add Film Grain

High
- Enable SSAO with conservative settings

Allow effects to be toggled easily.

------------------------------------------------
Bloom Rules
------------------------------------------------

Do NOT bloom the whole scene.

Only emissive materials should glow:

- Theyyam eyes
- Chathan eyes
- Fire
- Lamps
- Magical objects

Dark objects must remain dark.

------------------------------------------------
Fog
------------------------------------------------

Fog should be one of the main atmosphere tools.

Use cool blue-grey fog.

Increase density with distance.

Characters should slowly disappear into mist.

------------------------------------------------
Performance
------------------------------------------------

Target:

60 FPS on mid-range laptops.

Avoid unnecessary render passes.

Avoid expensive shaders.

Disable heavy effects when not required.

Only update animated post-processing values when necessary.

------------------------------------------------
Visual Style
------------------------------------------------

The game should feel:

- lonely
- mysterious
- unsettling
- damp
- cinematic
- dream-like

Not flashy.

The player should notice the atmosphere without noticing the effects themselves.

The final result should look like a professionally lit indie horror game rather than a scene with obvious filters.