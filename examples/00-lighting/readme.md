# 00 lighting

I implemented Diffuse Reflection/Specular Highlights/Specular Highlights at Silhouettes following [GLSL Programming/Unity
](https://en.wikibooks.org/wiki/GLSL_Programming/Unity) tutorial.



## Diffuse Reflection 

![alt text](../assets/images/00-lighting/reflection_raw.jpg)

![alt text](https://wikimedia.org/api/rest_v1/media/math/render/svg/27ef6ee14586c1f3905635729546d2a8b02d6ed4)

![](https://wikimedia.org/api/rest_v1/media/math/render/svg/3d622b3ce047284e8c88a769fc7c758df5476b3b): Incoming Light

![](https://wikimedia.org/api/rest_v1/media/math/render/svg/76280f2d41b2ca93522f58182c83db22a7f6f088): Diffuse reflection

Tutorial: [GLSL_Programming/Unity/Diffuse_Reflection](https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Diffuse_Reflection)


## Specular Hightlights

I follow [https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Specular_Highlights](https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Specular_Highlights) tutorial, and use **Phong reflection model**.

![alt text](../assets/images/00-lighting/specular_hightlight.jpg)

the normalized reflected direction **R** is defined by:

![alt text](https://wikimedia.org/api/rest_v1/media/math/render/svg/260e2396e0621c692b7e9bac3432f592987e868d)


![alt text](https://wikimedia.org/api/rest_v1/media/math/render/svg/8271459017596c6e89a119e9dc1a36015760cd07):  shininess of the material

 The specular term of the Phong reflection model is then:

 ![alt text](https://wikimedia.org/api/rest_v1/media/math/render/svg/553c2705692562e9a6b90d4c175b876dc834725c)


Tutorial: [GLSL Programming/Unity/Specular Highlights](https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Specular_Highlights)

## Specular Hightlights at Silhouettes

![alt text](../assets/images/00-lighting/specular_hightlight_silhouette.jpg)


Schlick's approximation is:

![alt text](https://wikimedia.org/api/rest_v1/media/math/render/svg/827c224d3cb3f44b6d684209aea217343957c1b2)![](https://wikimedia.org/api/rest_v1/media/math/render/svg/e140e61cf745fcbc82701ffaebe427d3bf2773f6)


![alt text](https://wikimedia.org/api/rest_v1/media/math/render/svg/553c2705692562e9a6b90d4c175b876dc834725c)

Replacing ![](https://wikimedia.org/api/rest_v1/media/math/render/svg/61de565284b2057d9355b1529e2b6464aa210b0f) by Schlick's approximation for the Fresnel factor with ![]()

![](https://wikimedia.org/api/rest_v1/media/math/render/svg/94164a9c7b88ec715b894ccd3300bc5002645230)


Tutorial: [GLSL Programming/Unity/Specular Highlights at Silhouettes](https://en.wikibooks.org/wiki/GLSL_Programming/Unity/Specular_Highlights_at_Silhouettes)


References

- Schlick, C. (1994). "[An Inexpensive BRDF Model for Physically-based Rendering](http://www.cs.virginia.edu/~jdl/bib/appearance/analytic%20models/schlick94b.pdf)"