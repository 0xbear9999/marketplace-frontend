import styled from 'styled-components';


export const IconWrapper = styled.div`
display: flex;
flex-direction: row;
gap: 20px;

@media screen and (max-width: 768px) {
    gap: 15px;
}

@media screen and (max-width: 480px) {
    gap: 10px;
}
`;

export const LinkWrapper = styled.div`
display: flex;
flex-direction: column;
gap: 10px;
margin-left: auto;
margin-right: auto;
`;

export const IconButton = styled.button`
color: #81451E;
font-weight: bold;
white-space: nowrap;
transition: all 0.2s ease-in-out;
font-size: 16px;
background: transparent;
border: 5px solid;
border-image: url("/images/footer/iconBorder.svg") 12 fill;
aspect-ratio: 1 / 1;
display: flex;
justify-content: center;
align-items: center;
padding: 5px;

:disabled {
    opacity: 0.3;
}

&:hover:not([disabled]) {
    cursor: pointer;
    transform: scale(1.05);
    transition: all 0.2s ease-in-out;
    box-shadow: -10px 10px 0px -4px rgba(0,0,0,0.6);
}

@media screen and (max-width: 480px) {
    padding: 2.5px;
}
`;

export const Icon = styled.img`
width: 100%;
max-width: 50px;
min-width: 15px;
height: auto;

@media screen and (max-width: 768px) {
    min-width: 12.5px;
}

@media screen and (max-width: 480px) {
    min-width: 10px;
}
`;

export const LinkTextS = styled.div`
font-size: 16px;
color: #E0D7CC;
text-decoration: none;

&:hover{
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

@media screen and (max-width: 1300px) {
    font-size: 14px;
}

@media screen and (max-width: 768px) {
    font-size: 12px;
}

@media screen and (max-width: 480px) {
    font-size: 11px;
}
`;

export const CopyrightText = styled.p`
font-size: 14px;
color: rgba(224,215,204, 0.5);
margin-left: auto;
margin-right: auto;
padding: 25px;
text-align: center;

@media screen and (max-width: 768px) {
    font-size: 12px;
}

@media screen and (max-width: 480px) {
    font-size: 11px;
}
`;

export const Divider = styled.div`
width: 100%;
border-top: 1px solid #FCEFDE;
`;

export const LinkTextA = styled.a`
font-size: 16px;
color: #E0D7CC;
text-decoration: none;

&:hover{
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

@media screen and (max-width: 1300px) {
    font-size: 14px;
}

@media screen and (max-width: 768px) {
    font-size: 12px;
}

@media screen and (max-width: 480px) {
    font-size: 11px;
}
`;
