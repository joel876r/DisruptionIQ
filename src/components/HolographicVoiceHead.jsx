import React from 'react';
import TamilAvatarVoiceGuide from './TamilAvatarVoiceGuide';

/**
 * Backward-compatible wrapper forwarding to TamilAvatarVoiceGuide.
 * Replaces the old robotic blue head with the realistic 3D Tamil AI Guide.
 */
export default function HolographicVoiceHead(props) {
  return <TamilAvatarVoiceGuide {...props} />;
}
