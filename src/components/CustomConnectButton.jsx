import { ConnectKitButton } from "connectkit";
import styled from "styled-components";
import React from "react";

const StyledButton = styled.button`
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 10px 20px; /* Reduced size */
  color: #ffffff;
  background: #1a88f8;
  font-size: 14px; /* Reduced font size */
  font-weight: 500;
  border-radius: 8px; /* Reduced border radius */
  box-shadow: 0 2px 12px -3px #1a88f8; /* Reduced box shadow */

  transition: 200ms ease;

  &:hover {
    transform: translateY(-3px); /* Reduced translateY on hover */
    box-shadow: 0 4px 24px -6px #1a88f8; /* Reduced box shadow on hover */
  }

  &:active {
    transform: translateY(-1px); /* Reduced translateY on click */
    box-shadow: 0 4px 20px -6px #1a88f8; /* Reduced box shadow on click */
  }

  /* New Tailwind CSS styles for the hand-drawn appearance and dark matte black background */
  background-color: #1a1a1a; /* Dark matte black */
  border: 2px solid #2c2c2c; /* Slightly lighter border color */
  box-shadow: none; /* Remove the original box shadow */
  transition: 200ms ease;

  &:hover {
    transform: translateY(-1px); /* Reduced translateY on hover */
    border-color: #1a88f8; /* Accent color on hover */
  }

  &:active {
    transform: translateY(0); /* Reduced translateY on click */
    border-color: #1a88f8; /* Accent color on click */
  }
`;

const ExampleButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <StyledButton onClick={show}>
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </StyledButton>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
export default ExampleButton;
