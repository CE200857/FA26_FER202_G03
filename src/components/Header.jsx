import React, { useContext } from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = ({ onOpenCart, cartItemCount = 0 }) => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate = "/login";
  };

  return (
    <Navbar bg="success" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to={isAdmin ? "/admin" : "/"}>
          SEOUL CENTER
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navigation" />
        <Navbar.Collapse id="main-navigation">
          <Nav className="me-auto">
            {!isAdmin && (
              <>
                <Nav.Link as={NavLink} to="/products">
                  Sản phẩm
                </Nav.Link>

                {isAuthenticated && (
                  <>
                    <Nav.Link as={NavLink} to="/vouchers">
                      Voucher
                    </Nav.Link>
                    <Nav.Link as={NavLink} to="/orders/history">
                      Đơn hàng
                    </Nav.Link>
                  </>
                )}
              </>
            )}

            {isAdmin && (
              <Nav.Link as={NavLink} to="/products">
                Xem cửa hàng
              </Nav.Link>
            )}
          </Nav>
          <Nav className="align-item-lg-center">
            {isAdmin && (
              <Button
                variant="outline-light"
                className="me-lg-2 mb-2 mb-lg-0"
                onClick={onOpenCart}
              >
                Giỏ hàng ({cartItemCount})
              </Button>
            )}

            {isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/profile">
                  {user.name}
                </Nav.Link>
                <Button variant="light" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ): (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Đăng nhập
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  Đăng ký
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;